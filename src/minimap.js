// Minimap system for Lands of Sand
// 2D pixelated minimap showing buildings, roads, and player position

let minimapCanvas, minimapCtx;
let minimapScale = 0.2; // Scale factor for world to minimap coordinates

function initMinimap() {
    minimapCanvas = document.getElementById('minimap');
    minimapCtx = minimapCanvas.getContext('2d');
    
    // Set up pixelated rendering
    minimapCtx.imageSmoothingEnabled = false;
    minimapCtx.webkitImageSmoothingEnabled = false;
    minimapCtx.mozImageSmoothingEnabled = false;
    minimapCtx.msImageSmoothingEnabled = false;
}

function updateMinimap() {
    if (!minimapCtx || !player) return;
    
    const canvas = minimapCanvas;
    const ctx = minimapCtx;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the minimap
    ctx.fillStyle = '#2F4F2F'; // Dark green background
    ctx.fillRect(0, 0, width, height);
    
    // Draw ground grid
    ctx.strokeStyle = '#3A5F3A';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw buildings as simple rectangles
    ctx.fillStyle = '#8B4513'; // Brown for buildings
    
    buildings.forEach(building => {
        const screenPos = worldToMinimapCoords(
            building.mesh.position.x, 
            building.mesh.position.z
        );
        
        const buildingWidth = building.bounds.width * minimapScale * 10;
        const buildingHeight = building.bounds.height * minimapScale * 10;
        
        ctx.fillRect(
            screenPos.x - buildingWidth / 2,
            screenPos.y - buildingHeight / 2,
            buildingWidth,
            buildingHeight
        );
    });
    
    // Draw roads/paths (simple lines connecting buildings)
    ctx.strokeStyle = '#D2B48C'; // Light brown for paths
    ctx.lineWidth = 2;
    
    // Simple path from spawn to house
    ctx.beginPath();
    const spawn = worldToMinimapCoords(0, 0);
    const house = worldToMinimapCoords(-8, -8);
    ctx.moveTo(spawn.x, spawn.y);
    ctx.lineTo(house.x, house.y);
    ctx.stroke();
    
    // Path from spawn to market
    ctx.beginPath();
    const market = worldToMinimapCoords(5, -3);
    ctx.moveTo(spawn.x, spawn.y);
    ctx.lineTo(market.x, market.y);
    ctx.stroke();
    
    // Draw NPCs as small colored dots
    npcs.forEach(npc => {
        const screenPos = worldToMinimapCoords(npc.position.x, npc.position.z);
        
        ctx.fillStyle = '#FFFF00'; // Yellow for NPCs
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // NPC outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    
    // Draw player as cyan dot
    if (player) {
        const playerScreenPos = worldToMinimapCoords(player.position.x, player.position.z);
        
        ctx.fillStyle = '#00FFFF'; // Cyan for player
        ctx.beginPath();
        ctx.arc(playerScreenPos.x, playerScreenPos.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Player outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw movement path if exists
        if (pathfinding && pathfinding.length > 0) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            
            ctx.beginPath();
            ctx.moveTo(playerScreenPos.x, playerScreenPos.y);
            
            pathfinding.forEach(pathPoint => {
                const pathScreenPos = worldToMinimapCoords(pathPoint.x, pathPoint.z);
                ctx.lineTo(pathScreenPos.x, pathScreenPos.y);
            });
            
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        }
    }
    
    // Draw minimap border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
    
    // Add minimap title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Map', width / 2, 12);
}

function worldToMinimapCoords(worldX, worldZ) {
    const canvas = minimapCanvas;
    
    // Convert world coordinates to minimap coordinates
    // Center the view on the player
    const offsetX = player ? player.position.x : 0;
    const offsetZ = player ? player.position.z : 0;
    
    const screenX = (worldX - offsetX) * minimapScale * 4 + canvas.width / 2;
    const screenY = (worldZ - offsetZ) * minimapScale * 4 + canvas.height / 2;
    
    return { x: screenX, y: screenY };
}

// Initialize minimap when DOM is ready
document.addEventListener('DOMContentLoaded', initMinimap);
