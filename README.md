# ShubhYatra

An AI-powered tourist safety platform designed to provide travelers with real-time, context-aware security information, scam detection, and community-driven hazard reporting.

## Features

1. AI-Powered Safety Briefings
- Uses Gemini AI to generate context-aware travel safety briefings tailored to the destination.
- Customizes advice based on traveler demographic profiles (solo, elderly, family, non-native speaker, disabled).
- Provides an at-a-glance overall safety risk score based on crowdsourced and verified data.

2. Scam Scanner (Visual AI Analysis)
- Allows users to upload photos of suspicious items like taxi meters, restaurant menus, or official badges.
- AI analyzes the image in real-time to detect fraudulent patterns or overcharging.
- Returns an AI Confidence score and immediate actionable advice.

3. Yatri Connect (Traveler Buddy System)
- Secure JWT-based authentication for user accounts.
- Connects users with other nearby travelers based on their shared locations.
- Integrated real-time messaging interface to communicate with matched travel buddies.

4. Emergency Action Hub
- One-tap access to emergency categories (Lost Passport, Medical Emergency, Theft/Robbery, Harassment, Lost Directions).
- Generates immediate, step-by-step guidance tailored to the specific emergency and the user's current location.

5. Crowdsourced Hazard Reporting
- Travelers can report hazards, incidents, or scams they encounter in real-time.
- Supports attaching photo evidence and severity ratings to reports.
- Feeds data directly into a dynamic map and the AI briefing ecosystem.

6. Authority Dashboard (Role-Based Admin Panel)
- A protected, role-based dashboard exclusively for verified administrators or local authorities.
- Admins can review raw crowdsourced hazard reports and manually verify them.
- Verified reports carry more weight in the AI's safety briefings and risk calculations.

## Folder Structure

- `frontend`: Next.js App Router with Tailwind CSS (JavaScript).
- `backend`: Node.js Express server.

## Setup & Run Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Copy `.env.example` to `.env` and fill in your values (MONGODB_URI, GEMINI_API_KEY).
4. Seed the database (creates the admin account and sample data):
   `node seed.js`
5. Run the development server:
   `npm run dev` (Runs on http://localhost:5001)

### Frontend Setup

1. Navigate to the frontend directory:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Run the development server:
   `npm run dev` (Runs on http://localhost:3000)

