# Lands of Sand 🏜️

A RuneScape-inspired PvP survival RPG built for the web. Click-to-move through a wasteland, join gangs, harvest resources, and work your way up to the Elite City!

## 🎮 Play Now

**[Play Lands of Sand](https://your-username.github.io/lands-of-sand)** *(Update this link after deployment)*

## ✨ Features

### Core Gameplay
- **Click-to-move** with A* pathfinding on a 60×36 tile grid
- **Gang system** - Join Scavvers, Iron Vipers, or Crystal Tong for zone benefits
- **Resource gathering** - Harvest scrap piles for items, XP, and rare relics
- **Wasteland Exchange** - Player-driven economy for trading items
- **Progressive stats** - Fighting, Gathering, Magicx, and Health

### World & Zones
- **Gang territories** with unique benefits and visual themes
- **Wilderness areas** for dangerous but rewarding exploration  
- **Exchange hub** - Safe trading zone in the center of the map
- **Elite City** - Secret endgame area unlocked through progression

### Progression System
- **Level cap of 20** (easily expandable)
- **Storyline relics** - Ancient Core, Glyph Plate, Crystal Inverter
- **Elite Ring** - Teleportation device earned through mastery
- **Auto-save** with localStorage persistence

## 🚀 Quick Start

### For Players
1. Click anywhere on the game canvas to move
2. Harvest brown scrap piles by walking over them
3. Join a gang for zone benefits and healing
4. Sell items at the Wasteland Exchange (blue building)
5. Avoid red raiders - they hurt but drop loot!
6. **Endgame**: Max all stats + collect all 3 relics + earn 1000 credits = Elite Ring

### Controls
- **Click** - Move to location
- **I** - Toggle inventory
- **Gang buttons** - Switch factions anytime

## 🛠️ Development

### Tech Stack
- **Frontend**: Vanilla HTML5 Canvas + JavaScript
- **Deployment**: GitHub Pages (no server required!)
- **Storage**: localStorage for save data

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/lands-of-sand.git
cd lands-of-sand

# Open index.html in your browser
# That's it! No build process needed.
```

### Dev Console
Open browser console and use `los.maxAll()` to instantly max your character for testing.

## 📋 Roadmap

### Phase 1: MVP ✅
- [x] Click-to-move with pathfinding
- [x] Gang system and territories  
- [x] Resource gathering and XP
- [x] Trading system
- [x] Elite City endgame

### Phase 2: Multiplayer
- [ ] WebSocket server with Node.js
- [ ] Real-time multiplayer
- [ ] Player vs player combat
- [ ] Item dropping on death

### Phase 3: Gang Warfare
- [ ] Territory control battles
- [ ] Gang vs gang combat
- [ ] Resource node control
- [ ] Gang progression system

### Phase 4: Enhanced Content
- [ ] Crafting system using relics
- [ ] Player housing in Elite City
- [ ] More storyline content
- [ ] Advanced combat mechanics

## 🎨 Design Philosophy

**Lands of Sand** combines the best elements of:
- **RuneScape**: Click-to-move, skill progression, player economy
- **RUST**: Full PvP, gang warfare, territorial control
- **Modern web games**: Instant play, no downloads, responsive design

The game is designed to be:
- **Immediately playable** - No registration or downloads
- **Progressively complex** - Simple start, deep endgame
- **Socially driven** - Gang dynamics and player interaction
- **Infinitely expandable** - Modular codebase for easy feature addition

## 🤝 Contributing

This is currently a solo project, but contributions are welcome! Areas where help would be appreciated:

- **Art & Design**: Better sprites, animations, UI improvements
- **Game Balance**: Tuning XP rates, loot tables, progression curves  
- **New Features**: Combat systems, crafting, housing
- **Bug Fixes**: Performance optimization, edge cases

## 📄 License

MIT License - Feel free to fork and create your own version!

## 🙏 Credits

Inspired by the classic gameplay of RuneScape and the player freedom of RUST. Built with love for the web gaming community.

---

*Ready to survive the wasteland? Click to play!*
