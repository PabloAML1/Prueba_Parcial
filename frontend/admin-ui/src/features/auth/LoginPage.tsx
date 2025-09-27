import { useContext, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Ctx } from "./AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { backendUrl, login } = useContext(Ctx) ?? {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must contain at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${backendUrl}/api/users/auth/login`,
        formData
      );

      if (data.success) {
        if (data.user?.role !== "ADMIN") {
          setError(data.message || "Incorrect credentials");
          return;
        }

        login?.();
        navigate("/app", { replace: true });
      } else {
        setError(data.message || "We were unable to log in.");
        toast.error(data.message || "We were unable to log in.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Server error";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-[minmax(0,1fr)_460px]">
      {/* lado izquierdo */}
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
            Manages employees, specialties, medical centers, and doctors 
            from a unique panel designed for clarity and speed.
          </p>
        </div>
      </div>

      {/* lado derecho login */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-xl shadow-indigo-100/40">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-slate-600">Log in to your health center</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-rose-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </p>
            )}

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className="text-primary hover:underline text-sm"
              >
                Did you forget your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Log in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
