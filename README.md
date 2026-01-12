# 🌿 GreenTrack - Gamified Sustainability Platform

GreenTrack is a community-driven web application designed to encourage and gamify environmental sustainability. Users can track their tree-planting activities, share updates with their local community, earn points, compete on leaderboards, and become "Community Leaders".

## 🚀 Features

### 🌱 Tree Management
- **Register Trees**: Log your planted trees with location, type, and photos.
- **Health Monitoring**: Track the health status of your trees over time.
- **My Trees**: A dedicated dashboard to view and manage your personal forest.

### 📍 Community & Feed
- **Local Communities**: Users are automatically assigned to communities based on their location (e.g., "Mumbai", "New York").
- **Local Feed**: Share updates, photos, and success stories with your neighbors.
- **Dual Points System**:
    - **Local Points**: Earned for community-specific actions (determines Community Leader).
    - **Global Points**: Total score for the global leaderboard.
- **Community Leader**: The user with the highest local points becomes the "Community Leader" and gets a **Crown Badge** 👑 on their profile and posts.

### 🏆 Gamification
- **Leaderboards**:
    - **Top Planters**: Global ranking of individual users.
    - **Top Communities**: Ranking of communities based on collective score.
- **Badges**: Unlock badges like "New Planter", "Forest Guardian", and more.
- **Levels**: Earn XP to level up your planter profile.

### 🔒 Security & Tech
- **Authentication**: Secure login/signup via Firebase Auth (Email/Password & Google).
- **Data Integrity**: Firestore Security Rules (simulated logic) ensure points cannot be farmed or faked.
- **Strict Likes**: One-like-per-user policy enforced transactionally.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS (Glassmorphism & Modern UI)
- **Backend & Database**: Firebase (Authentication, Firestore)
- **Maps & Location**: Browser Geolocation API
- **Icons**: Lucide React

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AMITJHA-hub/GREENTRACK.git
   cd GREENTRACK
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

This project is optimized for deployment on **Vercel** or **Netlify**.

1. Connect your GitHub repository to Vercel/Netlify.
2. Set the *Build Command* to `npm run build`.
3. Set the *Output Directory* to `dist`.
4. Add your `.env` variables in the Vercel/Netlify dashboard settings.

## 🤝 Contributing

Join us in making the world greener!
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Built with 💚 for the planet.*
