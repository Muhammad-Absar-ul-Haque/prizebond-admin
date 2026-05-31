<div align="center">
  <h1>🏆 PrizeBond PK Admin Dashboard</h1>
  <p>A production-grade, highly responsive admin panel built with React.js</p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS" />
    <img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react&logoColor=white" alt="Recharts" />
  </p>
</div>

---

## 🌟 Overview

**PrizeBond PK Admin** is a sophisticated, custom-designed dashboard engineered for managing prize bond users, draw results, and analytics. Built purely with React.js without relying on heavy external UI frameworks (like Material-UI or Ant Design), it boasts a custom design system with a premium dark theme and elegant gold accents.

This project demonstrates strong frontend architecture, state management, component reusability, and a deep understanding of modern UI/UX principles.

## 🎯 Why This Project Stands Out

- **Zero UI Libraries:** Every component—from the slide-over panels to the toast notifications and data tables—was built from scratch. This showcases a strong grasp of core CSS, React state, and component composition.
- **Production-Ready Architecture:** Clean folder structure separating services, contexts, and presentation layers.
- **Attention to Detail:** Implemented skeleton loaders, dynamic status badges, confirmation modals, and responsive layouts to ensure a flawless user experience.

## ✨ Key Features

- **Advanced User Management:** Comprehensive data table with real-time search and status filtering (Pending, Active, Rejected).
- **Interactive Analytics:** Visualized data using `recharts` for tracking system performance and user statistics.
- **Seamless UX/UI:** 
  - Custom slide-over detail panels for quick viewing.
  - Interactive confirmation modals for critical actions (Approve/Reject).
  - Global, context-driven toast notification system.
  - Smooth skeleton loading states for asynchronous data fetching.
- **Custom Design System:** Deep navy/midnight blue palette with elegant typography (Syne, DM Sans, DM Mono).

## 💻 Tech Stack

- **Frontend:** React.js (v18)
- **Data Visualization:** Recharts
- **Styling:** Custom Vanilla CSS / CSS Modules
- **State Management:** React Context API & Hooks
- **API Integration:** Fetch API (with scalable service layer)

## 📁 Project Architecture

The codebase is meticulously organized for scalability:

```text
src/
├── components/          # Reusable UI elements
│   ├── Sidebar.js       # Global navigation
│   ├── Topbar.js        # Header with user profile/actions
│   ├── StatusBadge.js   # Dynamic status indicators
│   ├── ConfirmModal.js  # Reusable action confirmation
│   └── UserDetailPanel.js # Slide-over contextual view
├── context/             # Global state management (e.g., ToastContext)
├── pages/               # Top-level route components
│   └── UserManagement.js 
├── services/            # API integration layer (Mock & Real endpoints)
├── App.js               # Application root & layout wrapper
└── index.css            # Global design tokens and utilities
```

## 🚀 Getting Started

Follow these instructions to run the application locally.

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Muhammad-Absar-ul-Haque/prizebond-admin.git
   cd prizebond-admin
   ```

2. **Environment Variables:**
   Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```
   *Update `REACT_APP_API_BASE_URL` with your actual backend endpoint if needed.*

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

4. **View the app:**
   Open [http://localhost:3001](http://localhost:3001) in your browser. *(Note: Defaults to 3001 to prevent conflicts with backend services).*

## 🔌 API Integration Setup

The project is structured to easily transition from mock data to a live backend API.

Navigate to `src/services/api.js`:
1. Update `BASE_URL` to your production endpoint.
2. Swap the mock functions with the provided real `fetch` logic.
3. JWT token handling via `localStorage` is pre-configured.

## 📸 Screenshots

*(Tip: Replace these placeholders with actual high-quality screenshots of your application)*

<div align="center">
  <img src="https://via.placeholder.com/800x450/0f172a/eab308?text=Dashboard+Overview" alt="Dashboard View" width="48%">
  <img src="https://via.placeholder.com/800x450/0f172a/eab308?text=User+Management+Table" alt="User Management" width="48%">
</div>

## 👨‍💻 Let's Connect!

I am actively looking for Frontend Developer roles. If you're looking for a developer who cares about architecture, design, and performance, let's talk!

**Muhammad Absar-ul-Haque**
- **GitHub:** [@Muhammad-Absar-ul-Haque](https://github.com/Muhammad-Absar-ul-Haque)
- **LinkedIn:** [Insert LinkedIn URL](https://linkedin.com/in/your-profile)
- **Portfolio:** [Insert Portfolio URL](https://your-portfolio.com)
- **Email:** [Insert Your Email](mailto:your.email@example.com)

---
<div align="center">
  <i>If you found this project interesting, please consider giving it a ⭐!</i>
</div>
