import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="grid h-screen w-full grid-cols-[280px_1fr] overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="h-screen overflow-y-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
