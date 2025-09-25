import { useContext, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { Ctx } from "./AuthContext";

export default function LoginPage() {
  const { login } = useContext(Ctx) ?? {};
  const nav = useNavigate();
  const loc = useLocation() as Location;
  const [email, setEmail] = useState("admin@example.com");
  const [pwd, setPwd] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!login) return;

    try {
      setIsLoading(true);
      setError(null);
      // TODO: replace with a real API call for authentication
      login("demo-token");
      nav(loc.state?.from?.pathname ?? "/app", { replace: true });
    } catch (err) {
      console.error(err);
      setError("We could not sign you in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-[minmax(0,1fr)_460px]">
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-400 p-10 text-indigo-50 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25)_0%,transparent_55%)]" />
        <div className="relative z-10 max-w-md space-y-6 text-left">
          <div className="flex items-center gap-3 text-indigo-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                Admin
              </p>
              <p className="text-2xl font-semibold">Control Center</p>
            </div>
          </div>
          <p className="text-base leading-relaxed text-indigo-50/90">
            Manage hospitals, specialties, and teams from a single dashboard
            designed for clarity and speed.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-indigo-50/80">
            <span className="rounded-full border border-white/20 px-4 py-1">
              Secure Access
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1">
              Role Management
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1">
              Real-time Updates
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-xl shadow-indigo-100/40">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6096ba]">
              Welcome Back
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Sign in to continue
            </h1>
            <p className="text-sm text-slate-500">
              Use your administrator credentials to access the control center.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#274c77] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#274c77] focus:bg-white focus:ring-2 focus:ring-indigo-100"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#274c77] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#274c77cc]  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-9  00 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-900"
              disabled={isLoading}
            >
              {isLoading ? "Signing in�" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Having issues? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
