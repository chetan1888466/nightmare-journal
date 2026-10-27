# 🎃 Nightmare Journal &bull; Haunted Twilight Edition

A simple, private website to record nightmares and transform them into short, gentle bedtime stories using your local Ollama AI model (`gemma4:e2b`), wrapped in a spooky, atmospheric Halloween theme.

**100% Local & Private**: All dreams are saved directly on your computer, the audio is synthesized procedurally in real time, and the AI runs entirely locally via Ollama. No online AI services are used.

---

## 🚀 How to Run the Website

### Step 1: Make sure your local Ollama is running
Open your terminal / command prompt and start your local Ollama model:
```bash
ollama run gemma4:e2b
```
*(Ollama will listen at `http://localhost:11434`)*

### Step 2: Start the Nightmare Journal Website
Open a terminal in this folder (`d:\nightmare-journal`) and run:
```bash
node server.js
```
*(Or if you prefer npm: `npm start`, or double-click `start.bat`)*

### Step 3: Open in your browser
Go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🎃 Halloween Atmosphere & Interactive Features

- **Dark Visual Theme**: Deep blacks, blood red, sickly necrotic green, and cold moonlight blue. Includes dark corner vignettes, film grain texture, and faint drifting fog across the screen.
- **Creepy Typography**: Google display fonts (`Creepster`, `Nosifer`, `Cinzel`, `MedievalSharp`) with offline local fallbacks. Cards and entries styled as aged, torn, stained grimoire paper with blood drips.
- **Ghosts & Creatures**:
  - Translucent ghosts drifting across the screen at varying altitudes and speeds.
  - Spiders on silk threads dropping down from the top of the screen.
  - Flapping bats gliding across the dark sky.
  - Glowing demon eyes in the corner that track the cursor and blink.
  - Peripheral shadowy figure at the edge of the screen that vanishes when the user moves the cursor toward it.
- **Interactive Scares**:
  - **Flashlight Cursor (`🔦 Flashlight`)**: Toggleable torchlight beam that illuminates only a small circle of the dark page as you move the cursor.
  - **Flickering Lights**: Periodic screen glitch / brownout effect.
  - **Hover Shudder**: Interactive elements shake and whisper when hovered.
  - **Glitching Text**: Periodic eerie whispers appearing in the header subtitle.
  - **Subtle Jump-Scare (`👻 Scares: On/Off`)**: Rare (<0.3s) spectral face flash accompanied by a sharp gasp/screech (strictly disabled when `prefers-reduced-motion` is active).
- **Procedural Web Audio Engine (`🩸 Enter the Nightmare` / `🔊 Audio`)**:
  - 100% synthesized offline via Web Audio API (no external audio files required!).
  - Deep atmospheric drone, distant howling wind, creaking whispers, and a **heartbeat whose speed accelerates dynamically as you move your mouse**.
  - Audio never autoplays; starts only after clicking "Enter the Nightmare" or toggling the audio button.
- **Gentle Animated Scene ("The Glowing Door")**:
  - Displays a calming animated scene for your transformed stories: layered drifting forest mist, a softly glowing amber door inside an ancient tree trunk, and a friendly owl perched on a branch that blinks and breathes gently.
  - Includes Play/Pause button and Reduced Motion accessibility mode.
- **Save Dreams on This Computer**: Stored permanently in `data/dreams.json`.
- **Gentle Story Transformation**: Uses local `gemma4:e2b` at `http://localhost:11434/api/chat`.

---

## 📁 Project Structure

```
nightmare-journal/
├── server.js          # Lightweight Node.js local web & API server
├── package.json       # Node configuration & start script
├── data/
│   └── dreams.json    # Local storage for all your saved dreams
├── public/
│   ├── index.html     # Website UI
│   ├── styles.css     # Calming twilight theme styles
│   └── app.js         # Client-side logic & Ollama communication
└── README.md          # Guide & instructions
```

---

## 🔒 Privacy & Offline Note
- **No external AI APIs**: Every AI request is strictly routed to `http://localhost:11434/api/chat`.
- **Local file storage**: Everything stays on your local machine in `data/dreams.json`.
