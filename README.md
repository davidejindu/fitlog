# FitLog 🏋️‍♂️ - Full-Stack Fitness Tracking Application

FitLog is a full-featured fitness tracking web application that helps users log workouts, analyze progress, and receive intelligent AI-powered feedback. Whether you're tracking strength, endurance, or overall fitness, FitLog is your all-in-one digital workout companion.

> ⚠️ **Note**: Because this app is hosted on free-tier platforms (Render, Neon, Vercel), initial load times may take **15–30 seconds** as the backend server may need to "wake up."

---

## 🌐 Live Demo

- **Frontend**: [fitlog-iota.vercel.app](https://fitlog-iota.vercel.app)
- **Backend**: [https://fitlog-z57z.onrender.com](https://fitlog-z57z.onrender.com)

---

## 🚀 Tech Stack

### Frontend

- React 18 + Vite
- Tailwind CSS & DaisyUI
- React Router DOM
- Axios (API calls)
- Context API (auth, theme)

### Backend

- Spring Boot 3 (Java 17)
- Spring Security + JWT Auth
- Spring Data JPA + Hibernate
- Google Gemini AI API Integration
- PostgreSQL (Neon)
- Docker (Multi-stage builds)

---

## 🔐 Authentication & Authorization

- JWT-based auth system (secure login/register)
- Role-based route protection
- Password encryption with BCrypt
- Auto token validation & logout handling

---

## 📋 Workout Management

- Create, edit, and delete workouts
- Log sets, reps, and weights for each exercise
- View workout history and detailed breakdowns
- Mobile-friendly workout builder interface

---

## 📈 Analytics & Insights

- **Workout Calendar**: Heatmap view of daily workout frequency
- **Progress Stats**: Total weight lifted, most-used exercises, trends
- **Goal-Based AI Feedback**:
  - Strength
  - Muscle Growth
  - Endurance
- Powered by Google Gemini AI

---

## 🎨 UI/UX Highlights

- Responsive design (desktop/mobile)
- Light/Dark theme toggle
- Modular component structure for clean code
- Real-time form validation and loading feedback
- Modern UI built with Tailwind CSS & DaisyUI

---

## 🛠️ Architecture & Dev Practices

- RESTful API design with DTO pattern
- Layered backend architecture:
  - Controller
  - Service
  - Repository
- CORS and environment configs for cross-origin support
- ESLint (frontend) and proper Java conventions (backend)
- Git version control with feature branches
- Deployed across:
  - Vercel (Frontend)
  - Render (Backend)
  - Neon (Database)

---

## 📦 Database Design

- PostgreSQL schema:
  - `User`
  - `Workout`
  - `WorkoutExercise`
  - `ExerciseSet`
- Normalized schema with foreign key constraints
- Optimized queries with indexing and caching
- Serverless DB hosted on Neon

---

## 🧠 AI Integration

- Google Gemini AI API for workout feedback
- Personalized recommendations based on fitness goals
- Caching of AI insights to reduce API costs

---

## 🐳 Deployment Strategy

- Dockerized backend (multi-stage build)
- Frontend deployed with Vercel (CI/CD)
- Backend on Render (containerized)
- Environment-specific configuration for secure deployment

