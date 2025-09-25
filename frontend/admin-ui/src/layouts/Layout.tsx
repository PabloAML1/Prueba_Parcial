import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <div className="col-span-1 row-span-2 border-r">
        <Sidebar />
      </div>
      <div className="col-start-2 row-start-1 border-b">
        <Topbar />
      </div>
      <main className="col-start-2 row-start-2 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
