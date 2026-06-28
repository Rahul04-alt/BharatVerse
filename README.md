# BharatVerse 🇮🇳

> **Explore India's Heritage, Culture & Hidden Gems — All in One Place**

BharatVerse is a feature-rich, full-stack React web application that brings India's cultural tapestry to life. Powered by Google Gemini AI and backed by Supabase, it combines interactive maps, immersive 360° tours, AI storytelling, and intelligent travel planning into a single platform for every culture enthusiast and explorer.

---

## 🌟 Live Demo

🔗 [Visit BharatVerse](https://github.com/Rahul04-alt/BharatVerse)

---

## ✨ Features

### 🗺️ Interactive India Map
- Leaflet-powered map with **Street, Satellite, and Terrain** base layers
- Custom emoji markers — 🏛️ Heritage Sites · 💎 Hidden Gems · 🛕 Temples
- Filter by **region** (North, South, East, West, Northeast, Central) and **type**
- **Search** places by name or state with live results
- **Smart route planner** using nearest-neighbor optimization
- One-click **"Navigate Route"** via Google Maps with live GPS start
- Add/remove stops, clear entire route dynamically

### 🤖 Gemini AI — Itinerary Planner
- Generate **personalized day-by-day travel itineraries** using Gemini 2.5 Flash
- Picks the perfect Indian state based on trip duration, season, and preferences
- **"Any State" mode** — AI randomly recommends a suitable destination each time
- Seasonal intelligence — summer hill stations, monsoon Northeast, winter deserts
- Displays structured daily schedule with timings, activities, and food stops

### 💬 AI Chatbot
- Conversational chatbot powered by **Google Gemini**
- Ask anything about Indian history, culture, food, travel tips, festivals
- Context-aware responses tailored to Indian heritage topics

### 📖 AI Storytelling
- 55+ curated cultural stories narrated via **AI-generated audio** (Gradio + HuggingFace)
- Custom audio player with play, pause, and replay controls
- Rich story images for every tale — mythology, history, folk stories

### 🏛️ Heritage Explorer
- Browse **UNESCO and national heritage sites** across all states
- Detailed pages with history, architecture, visiting hours, entry fees
- Photo galleries and related heritage recommendations

### 🎭 Festivals of India
- Explore India's diverse festivals with **rich media content**
- State-wise and season-wise festival discovery
- Cultural significance, traditions, and celebration details

### 🎨 Arts & Crafts
- Discover **traditional art forms** state by state — Madhubani, Warli, Pattachitra, Kathak and more
- Artist profiles, technique descriptions, and cultural background

### 💎 Hidden Gems
- **Off-the-beaten-path** destinations curated across India
- Places like Dhanushkodi, Living Root Bridges, and more unexplored wonders
- Rating, visitor counts, and travel tips

### 🔮 Ritual Explorer
- Deep-dive into India's **ancient rituals and traditions**
- Detailed descriptions, significance, and regional variations

### 🌐 360° Virtual Tours
- Immersive **panoramic viewer** for heritage sites using custom PanoViewer
- Drag-to-explore experience right in the browser

### 🎵 Global Music Player
- Persistent **ambient Indian folk and classical music** player across all pages
- Non-intrusive floating player with play/pause controls

### 🧠 Cultural Quiz
- Multi-category quiz on **Indian history, geography, culture, and festivals**
- Real-time scoring with progress tracking
- **Badge system** — Bronze 🥉, Silver 🥈, Gold 🥇, Perfect Score ⭐ based on performance
- Leaderboard powered by Supabase

### 🔍 Smart Recommendations
- **NLP-powered recommendation engine** (HuggingFace Space backend)
- Type a place, mood, or activity and get personalized Indian destination suggestions
- Save favorites to a personal collection

### 👤 User Account & Profile
- Authentication via **Clerk** (Sign up, Sign in, Social login)
- Personal dashboard with bookmarks, quiz stats, and badges
- Progress tracking across the entire platform
- Review and **star-rating system** for heritage sites and hidden gems

### 📤 Community Uploads
- Upload your own **travel photos and stories**
- Share hidden gems and local experiences with the community
- Cloudinary-powered image hosting

---

## 🧱 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, React Router v7, Tailwind CSS, Framer Motion |
| **AI / ML** | Google Gemini 2.5 Flash API, Gradio Client (HuggingFace) |
| **Auth** | Clerk (`@clerk/clerk-react`) |
| **Database & Storage** | Supabase (PostgreSQL + File Storage) |
| **Maps** | Leaflet, React-Leaflet |
| **State Management** | Zustand, React Query |
| **Forms** | React Hook Form |
| **UI Components** | Lucide React, React Icons, React Hot Toast |
| **Animations** | Framer Motion |
| **Build Tooling** | Vite, ESLint, PostCSS, Autoprefixer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone the repository

```bash
git clone https://github.com/Rahul04-alt/BharatVerse.git
cd BharatVerse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Authentication (Required — app won't start without this)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase — database, auth & storage (Required)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Gemini AI — itinerary planner & chatbot (Required for AI features)
VITE_GEMINI_API_KEY=AIza...

# Optional — features degrade gracefully without these
VITE_GOOGLE_MAPS_KEY=AIza...      # Map navigation
VITE_YOUTUBE_KEY=AIza...          # YouTube video embeds
VITE_WEATHER_KEY=...              # Weather info
VITE_AI_API_URL=http://localhost:8000  # Local AI backend (defaults to localhost)
```

| Key | Where to get it |
|-----|----------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → Dashboard → API Keys |
| `VITE_SUPABASE_URL` & keys | [supabase.com](https://supabase.com) → Project Settings → API |
| `VITE_GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| `VITE_GOOGLE_MAPS_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → Maps JavaScript API |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## 📁 Project Structure

```
BharatVerse/
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
└── src/
    ├── assets/              # Images, videos, and static media
    ├── components/          # Reusable UI components
    │   ├── AudioPlayer.jsx
    │   ├── ChatBot.jsx
    │   ├── GlobalMusicPlayer.jsx
    │   ├── GeminiItineraryForm.jsx
    │   ├── PanoViewer.jsx
    │   ├── Quiz.jsx
    │   ├── ReviewSystem.jsx
    │   └── ...
    ├── constants/           # App-wide constants and asset maps
    ├── contexts/            # React context (AppContext)
    ├── data/                # Static JSON — states, festivals, heritage, arts, quiz
    ├── hooks/               # Custom hooks (auth, bookmarks, search, geolocation)
    ├── lib/                 # Supabase client setup
    ├── pages/               # Full page components (17 pages)
    │   ├── HomePage.jsx
    │   ├── MapPage.jsx
    │   ├── HeritagePage.jsx
    │   ├── ItineraryPlanner.jsx
    │   ├── StoryTellingPage.jsx
    │   ├── RecommendationsPage.jsx
    │   └── ...
    ├── services/            # API, Gemini, quiz, badge, bookmark services
    └── utils/               # Helpers, validators, itinerary calculator
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 5173 |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## 📱 PWA Support

BharatVerse is a **Progressive Web App** — install it on your phone or desktop directly from the browser for an app-like experience with offline support via service worker.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for India's incredible culture and heritage</p>
