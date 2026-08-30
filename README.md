# ⚽ Penalty Shooter

**Penalty Shooter** is a browser-based 3D penalty football game built for GitHub Pages. Aim for the corners, control spin, and beat a progressively harder goalkeeper.

## 🎮 Features

- 3D stadium-style presentation using Three.js
- Physics-based ball flight with gravity, air drag, bounce/friction and spin/Magnus-style curve
- Procedural football texture and real-time shadows
- Goalkeeper AI that becomes harder as levels increase
- Shootout mode with 5-shot level progression
- Endless mode with increasing difficulty
- Desktop and mobile/touch controls
- Aim left/right/up/down and add left/right spin
- Power indicator and scoring HUD
- Goal, save and kick audio feedback using browser audio
- Responsive layout for phones and PCs
- No build step required — runs directly on GitHub Pages

## 🕹️ Controls

### Mobile
- Drag across the game to aim and release to shoot
- Use ◀ ▲ ▶ to fine-tune aim
- Use ↶ / ↷ for spin
- Use **SHOOT** to fire

### Desktop
- Mouse drag to aim and release to shoot
- Arrow keys or WASD to fine-tune aim
- Space to shoot

## 🌐 Play Online

**GitHub Pages:** https://salarkhurram989.github.io/Penalty-Shooter/

**Repository:** https://github.com/salarkhurram989/Penalty-Shooter

## 🛠️ Technology

- HTML5
- CSS3
- JavaScript ES Modules
- Three.js
- GitHub Pages

Three.js is loaded from jsDelivr at runtime, so an internet connection is required for the 3D library.

## 📁 Project Structure

```text
Penalty-Shooter/
├── index.html   # Game UI and page shell
├── style.css    # Responsive interface styling
├── game.js      # 3D scene, physics, AI and gameplay
└── README.md    # Project documentation
```

## 🚀 Run Locally

Because this is an ES-module web game, serve the folder with a small local web server rather than opening `index.html` directly with `file://`.

For example, with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## 📌 Project Goal

The goal of Penalty Shooter is to combine arcade accessibility with believable football-ball behavior: velocity changes through gravity and drag, bounce and friction on the pitch, and curved flight influenced by spin.

## 👤 Author

Created by **Salar**.
