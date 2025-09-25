// import { useAuth } from '@/features/auth/useAuth';

const Topbar = () => {
  //   const { logout } = useAuth();
  return (
    <header className="h-full flex items-center justify-between px-4">
      <div className="font-medium">Welcome</div>
      <button className="border px-3 py-1 rounded">Logout</button>
    </header>
  );
};

export default Topbar;
