# Lands of Sand - RuneScape Classic Style

A 3D web game built with Three.js that recreates the classic RuneScape visual style and gameplay mechanics.

## Features

### 🎮 Core Gameplay
- **Click-to-move** with A* pathfinding and diagonal movement
- **3D isometric camera** following the player
- **RuneScape Classic visual style** with flat shading and pixelated textures
- **Interactive NPCs** with overhead chat text
- **Real-time minimap** showing buildings, NPCs, and player location

### 🏗️ World & Graphics
- **Half-timber house** with white plaster and brown beam construction
- **Market stall** with canopy and wooden counter
- **Procedural cobblestone textures** with nearest-neighbor filtering
- **Atmospheric lighting** with sun and ambient light
- **Shadow mapping** for realistic depth

### 🗺️ Minimap System
- **2D pixelated minimap** in top-right corner
- **Building rectangles** showing world structures
- **Player position** as cyan dot
- **NPC locations** as yellow dots
- **Movement path** visualization
- **Grid overlay** for navigation reference

### 💬 Chat System
- **Overhead NPC text** in classic yellow with black outline
- **Chat panel** with colored player and NPC names
- **Timed chat messages** that appear periodically

## Technical Implementation

### 🛠️ Tech Stack
- **Three.js r128** for 3D rendering
- **Vanilla JavaScript** for game logic
- **HTML5 Canvas** for minimap rendering
- **CSS3** for UI styling

### 📁 File Structure
```
├── index.html          # Main HTML file with UI
├── src/
│   ├── main.js         # Core game logic and Three.js setup
│   └── minimap.js      # 2D minimap rendering system
├── assets/
│   └── atlas.png       # Texture atlas (placeholder)
└── README.md
```

### 🎨 Visual Style
- **Flat shading** on all 3D models
- **Nearest filter textures** for pixelated look
- **Bold, saturated colors** with dusty tones
- **Simple geometry** with minimal bevels
- **Power-of-two textures** for optimal performance

## Getting Started

1. **Open `index.html`** in a modern web browser
2. **Click on the ground** to move your character
3. **Watch NPCs** for periodic chat messages
4. **Use the minimap** to navigate the world

## Controls

- **Left Click**: Move to location
- **Mouse Hover**: Show "Walk here" tooltip
- **Auto Camera**: Follows player automatically

## Game World

### 🏘️ Buildings
- **Half-timber House**: Residential building with traditional styling
- **Market Stall**: Trading post with red canopy

### 👥 NPCs
- **Shopkeeper**: Sells coal certificates
- **Trader**: Offers various goods

### 🗺️ Navigation
- **Grid-based movement** with pathfinding
- **Obstacle avoidance** around buildings
- **Diagonal movement** support

## Development

### 🚀 Running Locally
Simply open `index.html` in your browser - no build process required!

### 🎯 Future Enhancements
- **Multiplayer support** with WebSocket server
- **Inventory system** and item interactions
- **Combat mechanics** with PvP battles
- **Gang territories** and faction warfare
- **Elite City** endgame content
- **More buildings** and world expansion

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Edge**: Full support

Requires WebGL support for 3D rendering.

---

*Built with ❤️ for the RuneScape Classic community*