import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-semibold text-slate-900">Belavia Personal Cabinet</h1>
        <p className="mt-3 text-slate-600">Scaffold is running. Frontend React + Tailwind is ready.</p>
        <p className="mt-2 text-sm text-slate-500">API base URL: {import.meta.env.VITE_API_BASE_URL ?? 'not configured'}</p>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
