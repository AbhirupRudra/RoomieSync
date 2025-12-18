# 🏠 RoomieSync  
> **AI-Powered Roommate Matching using Lifestyle DNA & Google Gemini**

![Stars](https://img.shields.io/github/stars/your-username/roomiesync?style=flat-square)
![Forks](https://img.shields.io/github/forks/your-username/roomiesync?style=flat-square)
![Issues](https://img.shields.io/github/issues/your-username/roomiesync?style=flat-square)
![License](https://img.shields.io/github/license/your-username/roomiesync?style=flat-square)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Full_Stack-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-UI-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Overview

**RoomieSync** is a modern, AI-driven roommate matching web application built to solve compatibility issues in shared living spaces.  
It combines **structured lifestyle profiling**, a **weighted matching algorithm**, and **Google Gemini AI reasoning** to help users find compatible roommates with transparency and confidence.

---

## 🚩 Problem Statement

Random or poorly informed roommate allocation often leads to conflicts related to:
- Cleanliness and hygiene
- Noise tolerance
- Sleep schedules
- Lifestyle and personal habits

Existing solutions lack intelligent reasoning and clear compatibility metrics.

---

## ✅ Proposed Solution

RoomieSync introduces a **Lifestyle DNA–based matching system** enhanced with **Gemini AI insights**.  
Users receive compatibility scores along with short AI-generated explanations, enabling data-driven roommate selection.

---

## ✨ Key Features

### 🔐 Authentication & Security
- Firebase Authentication for secure login
- Automatic profile initialization
- Unique DiceBear avatar generation

### 🧬 Lifestyle DNA Profiling
- 7-point segmented sliders for:
  - Sleep schedule
  - Noise tolerance
  - Cleanliness level
- Preference toggles for smoking and pets
- Personal bio for contextual personality insights

### 🧠 Gemini AI Compatibility Analysis
- Uses `gemini-3-flash-preview`
- Generates concise synergy summaries
- Highlights potential conflicts and compatibility strengths

### ⚖️ Smart Matching Algorithm
- Weighted scoring system
- Higher priority for critical lifestyle factors
- Gender-aware and consent-based filtering
- Transparent compatibility breakdown

### 📬 Real-Time Roommate Requests
- Send and receive rooming requests
- Accept / Reject workflow
- Live updates via Firebase Firestore

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS |
| AI | Google Gemini API |
| Backend | Firebase Firestore |
| Auth | Firebase Authentication |
| Avatars | DiceBear API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- Firebase project with Firestore and Authentication enabled
- Google AI Studio API key

### Installation

git clone https://github.com/your-username/roomiesync.git
cd roomiesync
npm install
Environment Configuration
Create a .env file in the root directory:

env
Copy code
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
Run the Application
bash
Copy code
npm run dev
🎨 UI / UX Design Philosophy
Clean, modern, and minimal interface

Mobile-first responsive design

Intuitive sliders and toggles

Subtle animations for user feedback

🔮 Future Enhancements
Room availability and location filters

Match history and analytics

AI-based conflict resolution suggestions

Progressive Web App (PWA) support

Institution-level deployment for hostels

👨‍💻 Author
Created by Abhirup
Engineering Student | Web & AI Enthusiast
Passionate about building practical, real-world solutions using modern web technologies.

📄 License
This project is licensed under the MIT License.
You are free to use, modify, and distribute this project with attribution.

<p align="center"> Built with ❤️ to improve shared living experiences. </p>