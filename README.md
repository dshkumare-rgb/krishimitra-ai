# 🌱 KrishiMitra AI (कृषिमित्र AI) - Farmer's Smart Assistant

**KrishiMitra AI** is a complete, full-stack, responsive web application designed to empower small and marginal landholding farmers with machine learning insights, pricing transparency, weather forecasting, disease detection, and financial tools.

Built with a modern green agriculture theme, the app offers bilingual support (English and Hindi) alongside an interactive voice assistant enabling hands-free navigation.

---

## 🛠️ Tech Stack & Key Integrations

### Frontend
- **React + TypeScript** (configured via Vite).
- **Tailwind CSS** (curated agricultural color palettes, full dark mode).
- **Framer Motion** (smooth layout transitions and micro-animations).
- **Leaflet Maps** (plots nearest markets and pest alert coordinates).
- **Chart.js + React-Chartjs-2** (historical price indices and weather trends).
- **jsPDF** (on-the-fly PDF advisory report downloads).
- **Firebase Authentication Client SDK** (for secure farming profiles).

### Backend
- **Node.js + Express** (REST API Gateway Core).
- **MongoDB + Mongoose** (for storing farmer profiles, records, and reports).
- **Multer** (handles memory buffer image uploads).
- **Google Gemini API** (via `@google/generative-ai` SDK, running multimodal vision checks).

---

## 💎 Robust Fallback & "Out-of-the-Box" Execution

To guarantee that the application is fully functional immediately upon download without requiring complex setups, KrishiMitra AI features built-in fallback modes:

1. **File-Based Fallback DB**: If MongoDB is not running or `MONGO_URI` is blank, the backend auto-switches to storing data in `backend/data/local_db.json`. It supports CRUD seeding, saving recommendations, user signups, and alerts.
2. **Simulated AI Engine**: If `GEMINI_API_KEY` is not present, the backend falls back to a rules-based agricultural algorithm that generates realistic crop suggestions, leaf diagnostics, and irrigation calendars matching input details.
3. **Simulated Authentication**: If Firebase client tokens are not configured, the frontend transparently logs users in using a simulated, local storage-backed account manager. 
   - Logging in with **`admin@krishimitra.com`** automatically unlocks the **Admin Panel**.
   - Logging in with any other email grants the standard **Farmer Profile**.

---

## 🚀 Getting Started (Local Run)

### Prerequisites
1. [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation & Launch

1. Open your terminal in the `krishimitra-ai` workspace root:
   ```bash
   C:\Users\dshku\.gemini\antigravity\scratch\krishimitra-ai
   ```

2. Install all workspaces and dependencies in one click:
   ```bash
   powershell -ExecutionPolicy Bypass -Command "npm run install-all"
   ```

3. Start both the Node Express server and the React Vite dev server concurrently:
   ```bash
   powershell -ExecutionPolicy Bypass -Command "npm run dev"
   ```

4. Open your browser at **`http://localhost:3000`**.

---

## 🔑 Test Accounts (Simulated Mode)
- **Farmer Profile**: Use `farmer@krishimitra.com` (password: any value)
- **Admin Control Portal**: Use `admin@krishimitra.com` (password: any value)

---

## 📁 Project Directory Map
```
krishimitra-ai/
├── README.md
├── package.json (npm workspace configurations)
├── backend/
│   ├── server.js (Express server entry point)
│   ├── config/
│   │   ├── db.js (mongoose + local fallback storage)
│   │   └── firebase.js (Firebase Admin configs)
│   ├── controllers/
│   │   ├── aiController.js (Gemini SDK & mock fallbacks)
│   │   ├── mandiController.js (Proximity Haversine math)
│   │   ├── weatherController.js (Open-Meteo REST calls)
│   │   └── alertController.js (Pest outbreaks and SMS warnings)
│   └── data/
│       ├── staticData.js (Mandi prices, Government schemes, Pest alerts)
│       └── local_db.json (Auto-generated database fallback)
└── frontend/
    ├── src/
    │   ├── App.tsx (core router layout)
    │   ├── context/
    │   │   ├── AuthContext.tsx (Firebase + simulated state provider)
    │   │   ├── LanguageContext.tsx (Bilingual EN/HI toggle)
    │   │   └── ThemeContext.tsx (class-based dark mode toggles)
    │   ├── components/
    │   │   ├── VoiceAssistant.tsx (Bilingual speech synthesizer)
    │   │   ├── MapContainer.tsx (Custom Leaflet marker overlay)
    │   │   └── ChartComponent.tsx (Visualizing price histories)
    │   └── pages/
    │       ├── Dashboard.tsx (Summary widgets, checklists)
    │       ├── CropRecommendation.tsx (Form with PDF results)
    │       ├── DiseaseDetection.tsx (Multer visions diagnostic uploader)
    │       ├── WeatherDashboard.tsx (Advisories with location lookup)
    │       └── AdminPanel.tsx (Seeding systems & CRUD managers)
```

---

## 🌐 Production Deployment Guide

### Backend (Express)
1. Set up a MongoDB cluster on **MongoDB Atlas** and get your connection string.
2. Get a Google Gemini API Key from the **Google AI Studio**.
3. Create a Firebase Project and retrieve your credentials.
4. Add these credentials into your backend `.env` file.
5. Deploy to hosting platforms like **Render**, **Railway**, or **Heroku** mapping environmental variables in their control panels.

### Frontend (React)
1. Run compilation build checks:
   ```bash
   npm run build:frontend
   ```
2. Deploy the generated `frontend/dist/` build directory to free static hosting systems like **Netlify**, **Vercel**, or **GitHub Pages**.
3. Configure redirect rewrites (e.g. `_redirects` file in netlify containing `/* /index.html 200` to support history routing).
