# Menticlone Walkthrough

This document outlines the features of the Mentimeter clone and how to run the project.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:3000`.

## Features

### 1. Landing Page
- A modern, responsive landing page with a hero section and feature highlights.
- Navigation to Login, Signup, and Dashboard.

### 2. User Dashboard
- **URL**: `/dashboard`
- View a list of your presentations.
- Create new presentations (mock functionality).
- Edit or Present existing presentations.

### 3. Presentation Editor
- **URL**: `/editor/[id]` (e.g., `/editor/1`)
- **Slide Sidebar**: Add, delete, and reorder slides.
- **Preview Area**: See how your slide looks in real-time.
- **Settings Sidebar**:
    - Change slide type (Multiple Choice, Word Cloud).
    - Edit question text.
    - Add/Edit/Remove options for multiple choice questions.

### 4. Audience Interaction (Participant View)
- **URL**: `/join` or `/join/[code]`
- Enter a game code to join a session.
- **Voting Interface**:
    - Real-time updates of the current question.
    - Select an option and submit your vote.
    - "Vote Submitted" confirmation screen.

### 5. Presenter View
- **URL**: `/present/[id]`
- Full-screen display of the current slide.
- **Live Results**: Real-time bar chart visualization of audience votes.
- Navigation controls to move between slides.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Hooks (Local state for prototype)

## Next Steps
- Connect to Supabase for real backend and real-time data.
- Implement authentication.
- Add more question types (Word Cloud visualization, Quiz, etc.).
