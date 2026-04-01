# 🏆 PrizeBond PK — React Admin Panel

A production-grade admin panel built with React (no extra UI libraries).

---

## 🚀 Setup & Run

```bash
npm install
npm start
```

Opens at `http://localhost:3001` (or 3000 if backend isn't running)

---

## 📁 Structure

```
src/
├── App.js                          # Root layout + routing
├── index.js / index.css            # Entry + global styles
├── components/
│   ├── Sidebar.js                  # Left navigation
│   ├── Topbar.js                   # Top header bar
│   ├── StatusBadge.js              # PENDING / ACTIVE / REJECTED badge
│   ├── ConfirmModal.js             # Approve / Reject confirmation dialog
│   └── UserDetailPanel.js          # Slide-over detail panel
├── pages/
│   └── UserManagement.js           # Main user management page
├── services/
│   └── api.js                      # Mock API (swap for real fetch calls)
└── context/
    └── ToastContext.js              # Global toast notifications
```

---

## ✅ Features

- **User table** with search, filter by status (ALL / PENDING / ACTIVE / REJECTED)
- **Stats bar** showing counts per status
- **Approve / Reject buttons** per row with confirmation modal
- **User detail slide-over panel** — click any row
- **Toast notifications** for all actions
- **Skeleton loading** while fetching
- **Sidebar badges** showing pending count
- Static sidebar tabs (Dashboard, Prize Bonds, Draw Results, Winners, Analytics, Settings)

---

## 🔌 Connecting to Real Backend

In `src/services/api.js`:

1. Set your backend URL:
```js
const BASE_URL = 'http://localhost:3000/api';
// or your deployed URL
```

2. In each function, uncomment the real fetch block and remove the mock block.

3. Add auth token handling — the template already has `localStorage.getItem('token')` in the commented sections.

---

## 🎨 Design

- Dark theme — deep navy / midnight blue
- Gold accent color system (PrizeBond brand)
- Fonts: Syne (headings) + DM Sans (body) + DM Mono (code/badges)
- No external UI library — pure React + inline styles
