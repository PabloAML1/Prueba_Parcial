import { useNavigate, useLocation, type Location } from "react-router-dom";
import { Ctx } from "./AuthContext";
import { useContext, useState } from "react";

export default function LoginPage() {
  const { login } = useContext(Ctx) || {};
  const nav = useNavigate();
  const loc = useLocation() as Location;
  const [email, setEmail] = useState("admin@example.com");
  const [pwd, setPwd] = useState("admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call real API, get JWT
    if (login) login("demo-token");
    nav(loc.state?.from?.pathname ?? "/app", { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form
        onSubmit={handleSubmit}
        className="w-[360px] space-y-4 border p-6 rounded-xl"
      >
        <h1 className="text-xl font-semibold">Sign in</h1>
        <input
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="w-full border p-2 rounded bg-black text-white">
          Login
        </button>
      </form>
    </div>
  );
}
