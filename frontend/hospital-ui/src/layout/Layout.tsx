import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="grid min-h-screen w-full grid-cols-[280px_1fr] bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="overflow-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
