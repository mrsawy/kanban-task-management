# 🎯 Kanban To-Do List Dashboard

A fully-featured, interactive Kanban board built with Next.js, featuring drag-and-drop functionality and real-time updates.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://mr-kanban.vercel.app/) [![Bonus Task](https://img.shields.io/badge/demo-live-success)](https://mr-kanban.vercel.app/bonus.html)

## 🚀 Live Demo

- **Main App**: [https://mr-kanban.vercel.app/](https://mr-kanban.vercel.app/)
 ![Main App](https://drive.google.com/file/d/1AxqnsAyZjio96rWQi7iyoNYEwK9WWu_6/view?usp=sharing)


- **Bonus Task**: [https://mr-kanban.vercel.app/bonus.html](https://mr-kanban.vercel.app/bonus.html)
![Bonus Task](https://drive.google.com/file/d/1Vs93Clee3r4VwyQkX0HjjsZdzgvkzxeX/view?usp=sharing)

## ✨ Features

- ✅ Four-column Kanban board (Backlog, In Progress, Review, Done)
- ✅ Create, update, and delete tasks
- ✅ Drag & drop between columns with smooth animations
- ✅ Search tasks by title or description
- ✅ Pagination/Infinite scroll
- ✅ Optimistic UI updates with React Query caching
- ✅ Fully responsive design

## 🛠️ Tech Stack

**Frontend**
- Next.js 14
- Zustand (State Management)
- React Query (Data Fetching)
- @hello-pangea/dnd (Drag & Drop)
- TypeScript

**Backend**
- json-server
- Deployed on AWS EC2

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd kanban-dashboard

# Install dependencies
pnpm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔌 Backend Setup (Optional - for local development)

```bash
# Install json-server globally
npm install -g json-server

# Run server
json-server --watch db.json --port 4000
```

## 🎁 Bonus Task

jQuery-based to-do list with add/delete functionality and fade animations.

## 📝 Task Schema

```json
{
  "id": 1,
  "title": "Design homepage",
  "description": "Include hero section",
  "column": "backlog"
}
```

## 🚀 Deployment

- **Frontend**: Vercel
- **Backend**: AWS EC2

---

**⏱️ Development Time**: ~3 hours (Main) + ~1 hour (Bonus)