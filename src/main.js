// Lands of Sand - RuneScape Classic Style
// Three.js implementation

let scene, camera, renderer, raycaster, mouse;
let player, npcs = [], buildings = [];
let ground, groundGrid = [];
let playerTarget = null;
let pathfinding = [];

// Chat system variables
let chatActive = false;
let chatInput = '';
let chatMessages = [];
let chatCursorVisible = true;

// Camera system variables
let cameraAngle = 0; // Current rotation angle in radians
let cameraDistance = 12; // Distance from player
let cameraHeight = 8; // Height above ground

// Game constants
const TILE_SIZE = 2;
const GRID_SIZE = 32;
const PLAYER_SPEED = 4;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 20, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 20, 15);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Raycaster for mouse picking
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Create world
    console.log('Creating ground...');
    createGround();
    console.log('Ground created successfully');
    
    console.log('Creating buildings...');
    createBuildings();
    console.log('Buildings created successfully');
    
    console.log('Creating player...');
    createPlayer();
    console.log('Player created successfully');
    
    console.log('Creating NPCs...');
    createNPCs();
    console.log('NPCs created successfully');

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    
    // Use only document keydown to avoid conflicts
    document.addEventListener('keydown', onKeyDown);
    
    console.log('Event listeners attached successfully');
    
    // Initialize chat display
    updateChatDisplay();
    
    // Add some initial chat messages
    chatMessages.push({
        name: 'Shopkeeper',
        message: 'Welcome to my shop!',
        type: 'npc'
    });
    chatMessages.push({
        name: 'Trader',
        message: 'Best prices in town!',
        type: 'npc'
    });
    updateChatBox();
    
    // Start cursor blinking
    setInterval(() => {
        chatCursorVisible = !chatCursorVisible;
        if (chatActive) updateChatDisplay();
    }, 500);

    // Set initial camera position
    updateCameraPosition();

    // Ensure keyboard events work
    document.body.style.outline = 'none';

    // Start game loop
    animate();
    
    console.log('Game initialization complete!');
}

function createGround() {
    // Create tile-based ground
    const textureLoader = new THREE.TextureLoader();
    
    // Create procedural cobblestone texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Cobblestone pattern
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add stones
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const size = 8 + Math.random() * 12;
        
        ctx.fillStyle = `rgb(${120 + Math.random() * 40}, ${100 + Math.random() * 30}, ${80 + Math.random() * 20})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Stone outline
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    const cobbleTexture = new THREE.CanvasTexture(canvas);
    cobbleTexture.magFilter = THREE.NearestFilter;
    cobbleTexture.minFilter = THREE.NearestFilter;
    cobbleTexture.wrapS = THREE.RepeatWrapping;
    cobbleTexture.wrapT = THREE.RepeatWrapping;
    cobbleTexture.repeat.set(16, 16);

    // Create ground geometry
    const groundGeometry = new THREE.PlaneGeometry(GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        map: cobbleTexture,
        flatShading: true
    });
    
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // Initialize pathfinding grid
    for (let x = 0; x < GRID_SIZE; x++) {
        groundGrid[x] = [];
        for (let z = 0; z < GRID_SIZE; z++) {
            groundGrid[x][z] = { walkable: true, x: x, z: z };
        }
    }
}

function createBuildings() {
    // Half-timber house
    const house = createHouse();
    house.position.set(-8, 0, -8);
    scene.add(house);
    buildings.push({ mesh: house, bounds: { x: -10, z: -10, width: 4, height: 4 } });

    // Market stall
    const stall = createMarketStall();
    stall.position.set(5, 0, -3);
    scene.add(stall);
    buildings.push({ mesh: stall, bounds: { x: 3, z: -5, width: 4, height: 4 } });

    // Update pathfinding grid for buildings
    buildings.forEach(building => {
        const bounds = building.bounds;
        for (let x = Math.max(0, bounds.x + GRID_SIZE/2); x < Math.min(GRID_SIZE, bounds.x + bounds.width + GRID_SIZE/2); x++) {
            for (let z = Math.max(0, bounds.z + GRID_SIZE/2); z < Math.min(GRID_SIZE, bounds.z + bounds.height + GRID_SIZE/2); z++) {
                if (groundGrid[x] && groundGrid[x][z]) {
                    groundGrid[x][z].walkable = false;
                }
            }
        }
    });
}

function createHouse() {
    const group = new THREE.Group();

    // House base (white plaster)
    const baseGeometry = new THREE.BoxGeometry(4, 3, 4);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFF8DC,
        flatShading: true
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1.5;
    base.castShadow = true;
    group.add(base);

    // Brown timber beams
    const beamMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        flatShading: true
    });

    // Vertical beams
    for (let i = 0; i < 3; i++) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 0.2), beamMaterial);
        beam.position.set(-1.8 + i * 1.8, 1.5, 1.9);
        beam.castShadow = true;
        group.add(beam);
    }

    // Horizontal beams
    for (let i = 0; i < 2; i++) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 0.2), beamMaterial);
        beam.position.set(0, 0.8 + i * 1.4, 1.9);
        beam.castShadow = true;
        group.add(beam);
    }

    // Roof
    const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    return group;
}

function createMarketStall() {
    const group = new THREE.Group();

    // Stall counter
    const counterGeometry = new THREE.BoxGeometry(3, 0.8, 1.5);
    const counterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xD2691E,
        flatShading: true
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.y = 0.4;
    counter.castShadow = true;
    group.add(counter);

    // Canopy poles
    const poleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        flatShading: true
    });
    
    for (let i = 0; i < 4; i++) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3), poleMaterial);
        pole.position.set((i % 2) * 2.5 - 1.25, 1.5, (Math.floor(i / 2)) * 1.5 - 0.75);
        pole.castShadow = true;
        group.add(pole);
    }

    // Canopy
    const canopyGeometry = new THREE.PlaneGeometry(3.5, 2.5);
    const canopyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFF6347,
        flatShading: true,
        side: THREE.DoubleSide
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = 3;
    canopy.rotation.x = -Math.PI / 2;
    group.add(canopy);

    return group;
}

function createPlayer() {
    // Simple cylinder player (capsule not available in r128)
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x4169E1,
        flatShading: true
    });
    
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0.8, 0);
    player.castShadow = true;
    
    // Add chat data to player
    player.userData = {
        chatText: '',
        chatTimer: 0,
        name: 'UNNAMED'
    };
    
    scene.add(player);
}

function createNPCs() {
    // Shopkeeper NPC
    const npc = createNPC(0xFF6B6B);
    npc.position.set(5, 0.8, -1);
    npc.userData = { 
        name: 'Shopkeeper',
        chatText: 'Selling 2 coal certs',
        chatTimer: 0
    };
    scene.add(npc);
    npcs.push(npc);

    // Another NPC
    const npc2 = createNPC(0x32CD32);
    npc2.position.set(-5, 0.8, 5);
    npc2.userData = { 
        name: 'Trader',
        chatText: 'Best prices in town!',
        chatTimer: 0
    };
    scene.add(npc2);
    npcs.push(npc2);
}

function createNPC(color) {
    const group = new THREE.Group();

    // Body (cylinder instead of capsule)
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 6);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        flatShading: true
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 6, 6);
    const headMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFDBAD,
        flatShading: true
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.7;
    head.castShadow = true;
    group.add(head);

    return group;
}

// Pathfinding A*
function findPath(start, end) {
    const openSet = [];
    const closedSet = [];
    const path = [];

    // Convert world coordinates to grid coordinates
    const startGrid = worldToGrid(start.x, start.z);
    const endGrid = worldToGrid(end.x, end.z);

    if (!isValidGridPos(startGrid.x, startGrid.z) || !isValidGridPos(endGrid.x, endGrid.z)) {
        return [];
    }

    const startNode = { ...groundGrid[startGrid.x][startGrid.z], g: 0, h: 0, f: 0, parent: null };
    startNode.h = heuristic(startNode, endGrid);
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
        // Find node with lowest f score
        let current = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < current.f) {
                current = openSet[i];
            }
        }

        // Remove current from openSet
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        // Check if we reached the goal
        if (current.x === endGrid.x && current.z === endGrid.z) {
            // Reconstruct path
            let temp = current;
            while (temp) {
                path.unshift(gridToWorld(temp.x, temp.z));
                temp = temp.parent;
            }
            break;
        }

        // Check neighbors
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedSet.find(n => n.x === neighbor.x && n.z === neighbor.z)) continue;
            if (!neighbor.walkable) continue;

            const tentativeG = current.g + 1;
            const existingNode = openSet.find(n => n.x === neighbor.x && n.z === neighbor.z);

            if (!existingNode) {
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, endGrid);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                openSet.push(neighbor);
            } else if (tentativeG < existingNode.g) {
                existingNode.g = tentativeG;
                existingNode.f = existingNode.g + existingNode.h;
                existingNode.parent = current;
            }
        }
    }

    return path;
}

function worldToGrid(x, z) {
    return {
        x: Math.floor((x + GRID_SIZE * TILE_SIZE / 2) / TILE_SIZE),
        z: Math.floor((z + GRID_SIZE * TILE_SIZE / 2) / TILE_SIZE)
    };
}

function gridToWorld(x, z) {
    return {
        x: (x * TILE_SIZE) - GRID_SIZE * TILE_SIZE / 2 + TILE_SIZE / 2,
        z: (z * TILE_SIZE) - GRID_SIZE * TILE_SIZE / 2 + TILE_SIZE / 2
    };
}

function isValidGridPos(x, z) {
    return x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE;
}

function getNeighbors(node) {
    const neighbors = [];
    const directions = [
        { x: -1, z: 0 }, { x: 1, z: 0 }, { x: 0, z: -1 }, { x: 0, z: 1 },
        { x: -1, z: -1 }, { x: -1, z: 1 }, { x: 1, z: -1 }, { x: 1, z: 1 }
    ];

    for (const dir of directions) {
        const newX = node.x + dir.x;
        const newZ = node.z + dir.z;
        
        if (isValidGridPos(newX, newZ)) {
            neighbors.push({ ...groundGrid[newX][newZ] });
        }
    }

    return neighbors;
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

// Event handlers
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update walk here tooltip
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground);
    
    if (intersects.length > 0) {
        const walkHere = document.getElementById('walkHere');
        walkHere.style.left = event.clientX + 10 + 'px';
        walkHere.style.top = event.clientY - 20 + 'px';
        walkHere.style.display = 'block';
    } else {
        document.getElementById('walkHere').style.display = 'none';
    }
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridPos = worldToGrid(point.x, point.z);
        const worldPos = gridToWorld(gridPos.x, gridPos.z);
        
        // Find path to clicked position
        pathfinding = findPath(player.position, worldPos);
        if (pathfinding.length > 0) {
            playerTarget = worldPos;
        }
    }

    document.getElementById('walkHere').style.display = 'none';
}

function onKeyDown(event) {
    const key = event.key;
    console.log('Key pressed:', key, 'Chat active:', chatActive);
    
    if (key === 'Enter') {
        console.log('Enter key pressed! Chat active:', chatActive, 'Current input:', chatInput);
        if (!chatActive) {
            // Start typing
            chatActive = true;
            chatInput = '';
            console.log('Starting chat input mode');
            updateChatDisplay();
        } else {
            // Send message
            console.log('Attempting to send message:', chatInput);
            if (chatInput.trim()) {
                const message = chatInput.trim();
                console.log('Sending message:', message);
                
                // Add to chat box
                chatMessages.push({
                    name: 'UNNAMED',
                    message: message,
                    type: 'player'
                });
                
                // Set overhead text for player
                if (player && player.userData) {
                    player.userData.chatText = message;
                    player.userData.chatTimer = 5.0; // Show for 5 seconds
                    console.log('Player overhead text set:', message, 'Timer:', player.userData.chatTimer);
                } else {
                    console.log('Player or userData not available for overhead text');
                }
                
                // Update chat box with new message
                updateChatBox();
            } else {
                console.log('Empty message, not sending');
            }
            
            // Stop typing
            chatActive = false;
            chatInput = '';
            console.log('Stopping chat input mode');
            updateChatDisplay();
        }
        event.preventDefault();
        return; // Make sure we don't fall through to other key handling
    } else if (key === 'Escape' && chatActive) {
        // Cancel typing
        chatActive = false;
        chatInput = '';
        updateChatDisplay();
        event.preventDefault();
    } else if (chatActive) {
        // Handle text input
        if (key === 'Backspace') {
            chatInput = chatInput.slice(0, -1);
            updateChatDisplay();
        } else if (key.length === 1) {
            // Regular character
            chatInput += key;
            updateChatDisplay();
        }
        event.preventDefault();
    } else {
        // Camera controls (only when not typing in chat)
        if (key === 'ArrowLeft') {
            cameraAngle += Math.PI / 4; // Rotate 45 degrees left
            console.log('Camera rotate left, new angle:', cameraAngle);
            updateCameraPosition();
            event.preventDefault();
        } else if (key === 'ArrowRight') {
            cameraAngle -= Math.PI / 4; // Rotate 45 degrees right
            console.log('Camera rotate right, new angle:', cameraAngle);
            updateCameraPosition();
            event.preventDefault();
        } else if (key === 'ArrowUp') {
            // Optional: Zoom in slightly
            cameraDistance = Math.max(8, cameraDistance - 2);
            console.log('Camera zoom in, new distance:', cameraDistance);
            updateCameraPosition();
            event.preventDefault();
        } else if (key === 'ArrowDown') {
            // Optional: Zoom out slightly
            cameraDistance = Math.min(16, cameraDistance + 2);
            console.log('Camera zoom out, new distance:', cameraDistance);
            updateCameraPosition();
            event.preventDefault();
        }
    }
}

function updateChatDisplay() {
    console.log('Updating chat display - Chat active:', chatActive, 'Input:', chatInput);
    const chatPrompt = document.getElementById('chatPrompt');
    const chatInputEl = document.getElementById('chatInput');
    const chatCursor = document.getElementById('chatCursor');
    
    if (!chatPrompt || !chatInputEl || !chatCursor) {
        console.error('Chat elements not found!', {chatPrompt, chatInputEl, chatCursor});
        return;
    }
    
    if (!chatActive) {
        // Show prompt
        console.log('Showing chat prompt');
        chatPrompt.style.display = 'inline';
        chatPrompt.textContent = 'PRESS ENTER TO START TYPING';
        chatInputEl.style.display = 'none';
        chatCursor.style.display = 'none';
    } else {
        // Show input
        console.log('Showing chat input mode');
        chatPrompt.style.display = 'none';
        chatInputEl.style.display = 'inline';
        chatInputEl.textContent = chatInput;
        chatCursor.style.display = chatCursorVisible ? 'inline' : 'none';
    }
}

function updateChatBox() {
    const chatBox = document.getElementById('chatBox');
    
    // Clear existing messages
    chatBox.innerHTML = '';
    
    // Add recent messages (keep last 10)
    const recentMessages = chatMessages.slice(-10);
    
    recentMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = msg.type === 'player' ? 'player-name' : 'npc-name';
        nameSpan.textContent = msg.name + ':';
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = ' ' + msg.message;
        messageSpan.style.color = '#FFFFFF';
        
        messageDiv.appendChild(nameSpan);
        messageDiv.appendChild(messageSpan);
        chatBox.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateCameraPosition() {
    if (!player || !camera) return;
    
    // Calculate camera position based on player position and angle
    const playerPos = player.position;
    
    const cameraX = playerPos.x + Math.cos(cameraAngle) * cameraDistance;
    const cameraZ = playerPos.z + Math.sin(cameraAngle) * cameraDistance;
    const cameraY = playerPos.y + cameraHeight;
    
    // Set camera position
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Make camera look at player
    camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z);
}

// Game loop
function animate() {
    requestAnimationFrame(animate);

    // Move player along path
    if (pathfinding.length > 0) {
        const target = pathfinding[0];
        const direction = new THREE.Vector3(target.x - player.position.x, 0, target.z - player.position.z);
        const distance = direction.length();

        if (distance < 0.1) {
            pathfinding.shift();
        } else {
            direction.normalize();
            direction.multiplyScalar(PLAYER_SPEED * 0.016); // 60fps
            player.position.add(direction);
        }
    }

    // Update player chat timer
    if (player && player.userData && player.userData.chatTimer > 0) {
        player.userData.chatTimer -= 0.016; // Decrease timer each frame
    }

    // Update NPC chat timers
    npcs.forEach(npc => {
        if (npc.userData.chatTimer > 0) {
            npc.userData.chatTimer -= 0.016;
        } else {
            npc.userData.chatTimer = 3 + Math.random() * 2; // Random chat interval
        }
    });

    // Update camera to follow player (orbit system)
    updateCameraPosition();

    // Render overhead chat text
    renderOverheadText();

    // Update minimap
    updateMinimap();

    renderer.render(scene, camera);
}

function renderOverheadText() {
    // Simplified overhead text rendering
    try {
        // Render player overhead text
        if (player && player.userData && player.userData.chatTimer > 0) {
            console.log('Rendering player overhead text:', player.userData.chatText, 'Timer:', player.userData.chatTimer);
            const vector = player.position.clone();
            vector.y += 2.5; // Slightly higher for player
            vector.project(camera);

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

            console.log('Overhead text position:', x, y);

            // Remove existing player chat element
            const existing = document.querySelector('.chat-overhead-player');
            if (existing) existing.remove();

            // Create new player chat element
            const chatElement = document.createElement('div');
            chatElement.className = 'chat-overhead-player';
            chatElement.style.position = 'absolute';
            chatElement.style.left = x + 'px';
            chatElement.style.top = y + 'px';
            chatElement.style.color = '#00FFFF'; // Cyan for player
            chatElement.style.fontSize = '12px';
            chatElement.style.fontWeight = 'bold';
            chatElement.style.textShadow = '1px 1px 0px #000000';
            chatElement.style.pointerEvents = 'none';
            chatElement.style.zIndex = '10';
            chatElement.style.transform = 'translate(-50%, -100%)';
            chatElement.textContent = player.userData.chatText;
            document.body.appendChild(chatElement);
            console.log('Overhead text element added to DOM');
        } else {
            // Remove player chat element when timer expires
            const existing = document.querySelector('.chat-overhead-player');
            if (existing) existing.remove();
        }

        npcs.forEach((npc, index) => {
            if (npc.userData && npc.userData.chatTimer > 2) {
                // Show chat text above NPC
                const vector = npc.position.clone();
                vector.y += 2;
                vector.project(camera);

                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

                // Remove existing chat elements
                const existing = document.querySelector(`.chat-overhead-${index}`);
                if (existing) existing.remove();

                // Create new chat element
                const chatElement = document.createElement('div');
                chatElement.className = `chat-overhead-${index}`;
                chatElement.style.position = 'absolute';
                chatElement.style.left = x + 'px';
                chatElement.style.top = y + 'px';
                chatElement.style.color = '#FFE600';
                chatElement.style.fontSize = '12px';
                chatElement.style.fontWeight = 'bold';
                chatElement.style.textShadow = '1px 1px 0px #000000';
                chatElement.style.pointerEvents = 'none';
                chatElement.style.zIndex = '10';
                chatElement.style.transform = 'translate(-50%, -100%)';
                chatElement.textContent = npc.userData.chatText;
                
                document.body.appendChild(chatElement);

                // Remove after a short time
                setTimeout(() => {
                    if (chatElement.parentNode) {
                        chatElement.parentNode.removeChild(chatElement);
                    }
                }, 2000);
            }
        });
    } catch (error) {
        console.error('Error rendering overhead text:', error);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log('Starting game initialization...');
    try {
        init();
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
