// Task Tracker with Firebase (React)
// Place this as src/App.jsx in a Create React App / Vite React project.
// Requires: firebase v9+, react, react-dom

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// ---------- Configure Firebase using environment variables ----------
// Create a .env file in your project root with keys shown below (replace values):
// REACT_APP_FIREBASE_API_KEY=...
// REACT_APP_FIREBASE_AUTH_DOMAIN=...
// REACT_APP_FIREBASE_PROJECT_ID=...
// REACT_APP_FIREBASE_STORAGE_BUCKET=...
// REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
// REACT_APP_FIREBASE_APP_ID=...

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function TaskCard({ task, onStatusChange, onDelete }) {
  return (
    <div className="card shadow p-3 flex justify-between items-center">
      <div>
        <div className="font-semibold">{task.name}</div>
        <div className="text-sm text-gray-600">Assigned: {task.assigned || "—"}</div>
        {task.due && <div className="text-xs text-gray-500">Due: {new Date(task.due.seconds * 1000).toLocaleString()}</div>}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <button onClick={() => onDelete(task.id)} className="px-3 py-1 border rounded">Delete</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ name: "", assigned: "", priority: "Normal", due: "" });
  const tasksCol = collection(db, "tasks");

  useEffect(() => {
    // Real-time listener: orders by createdAt descending
    const q = query(tasksCol, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(list);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      assigned: form.assigned.trim(),
      priority: form.priority,
      status: "To Do",
      createdAt: serverTimestamp(),
      due: form.due ? new Date(form.due) : null,
    };
    await addDoc(tasksCol, payload);
    setForm({ name: "", assigned: "", priority: "Normal", due: "" });
  };

  const updateStatus = async (id, status) => {
    const ref = doc(db, "tasks", id);
    await updateDoc(ref, { status });
  };

  const deleteTask = async (id) => {
    const ref = doc(db, "tasks", id);
    await deleteDoc(ref);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Team Task Tracker (with Firebase)</h1>

      <form onSubmit={addTask} className="mb-6 grid gap-2 grid-cols-1 md:grid-cols-4">
        <input
          placeholder="Task name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          placeholder="Assigned to"
          value={form.assigned}
          onChange={(e) => setForm({ ...form, assigned: e.target.value })}
          className="p-2 border rounded"
        />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="p-2 border rounded">
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>
        <div className="flex gap-2">
          <input type="datetime-local" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="p-2 border rounded flex-1" />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        <section>
          <h2 className="font-semibold mb-2">To Do</h2>
          <div className="flex flex-col gap-2">
            {tasks.filter(t => t.status === "To Do").map(t => (
              <TaskCard key={t.id} task={t} onStatusChange={updateStatus} onDelete={deleteTask} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">In Progress</h2>
          <div className="flex flex-col gap-2">
            {tasks.filter(t => t.status === "In Progress").map(t => (
              <TaskCard key={t.id} task={t} onStatusChange={updateStatus} onDelete={deleteTask} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Done</h2>
          <div className="flex flex-col gap-2">
            {tasks.filter(t => t.status === "Done").map(t => (
              <TaskCard key={t.id} task={t} onStatusChange={updateStatus} onDelete={deleteTask} />
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-6 text-sm text-gray-500">Data stored in Firebase Firestore (collection: "tasks").</footer>
    </div>
  );
}

/*
----------------------------
How to use this code
----------------------------
1. Create a React app (CRA or Vite). Example with CRA:
   npx create-react-app task-tracker
   cd task-tracker

2. Install Firebase:
   npm install firebase

3. Replace src/App.js (or src/App.jsx) with this file's contents.

4. Add environment variables in a .env file (project root):
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...

   Then restart dev server if running.

5. In Firebase Console:
   - Create a new project.
   - Go to Firestore Database → Create database → Start in production or test mode (for testing use test rules but secure it later).
   - Copy the config values into your .env.

6. Run locally:
   npm start

7. Deploy (Render / Vercel / Netlify): build then host. Example Render settings:
   Build Command: npm ci && npm run build
   Start Command: npx serve -s build
   (Or use a static host like Netlify/Vercel that serves the build folder.)

Security notes:
- For production, set Firestore security rules so only authenticated users or your project's users can read/write as appropriate.
- Consider adding authentication (Firebase Auth) so you can track who created/updated tasks.
*/
