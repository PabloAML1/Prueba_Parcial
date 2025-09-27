import { useContext, useState } from "react";
import { Mail, ArrowLeft, CheckCircle, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Ctx } from "./AuthContext";

export default function ResetPasswordPage() {
  const { backendUrl } = useContext(Ctx) ?? {};
  const [step, setStep] = useState<
    "email" | "code" | "newPassword" | "success"
  >("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "The email is not valid" });
      return;
    }
    setLoading(true);
    setErrors({});
    const { data } = await axios.post(
      `${backendUrl}/api/users/auth/send-reset-otp`,
      { email }
    );
    if (data.success) {
      toast.success(data.message);
      setStep("code");
      setLoading(false);
    } else {
      toast.error(data.message);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setOtp(newCode.join(""));
    if (value && index < 5)
      document.getElementById(`reset-code-${index + 1}`)?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`reset-code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setErrors({ code: "Enter the complete code" });
    setStep("newPassword");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!newPassword) newErrors.newPassword = "The password is mandatory";
    else if (newPassword.length < 6)
      newErrors.newPassword = "It must have at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "The passwords do not match";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({}); // limpia errores antes de la petición

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/users/auth/reset-password`,
        {
          email,
          otp,
          newPassword,
        }
      );

      if (data.success) {
        toast.success(data.message);
        setStep("success");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        // Mostrar error del backend
        setError(data.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
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
            Manages employees, specialties, medical centers, and doctors from a
            unique panel designed for clarity and speed.
          </p>
        </div>
      </div>

      {/* lado derecho reset */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-xl shadow-indigo-100/40">
          {/* botón volver */}
          {step !== "success" && (
            <button
              onClick={() =>
                step === "email" ? navigate("/login") : setStep("email")
              }
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === "email" ? "Return to login" : "Return"}
            </button>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password reset!</h1>
              <p className="text-slate-600 mb-6">
                Your password has been successfully reset. You can now log in.
              </p>
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 mt-4">
                Redirecting to login...
              </p>
            </div>
          )}

          {step === "email" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Reset password</h1>
                <p className="text-slate-600">
                  Enter your email address and we will send you a code to reset
                  your password.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-rose-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending code...
                    </div>
                  ) : (
                    "Send reset code"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Enter the code</h1>
                <p className="text-slate-600">
                  We have sent you a 6-digit code to
                </p>
                <p className="font-medium text-slate-900">{email}</p>
              </div>
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <input
                      autoComplete="off"
                      key={index}
                      id={`reset-code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ))}
                </div>
                {errors.code && (
                  <p className="text-rose-600 text-sm mt-2 text-center">
                    {errors.code}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Checking...
                    </div>
                  ) : (
                    "Send Code"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "newPassword" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Set new password</h1>
                <p className="text-slate-600">
                  Create a new password for your account.
                </p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword)
                          setErrors((prev) => ({ ...prev, newPassword: "" }));
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
                      placeholder="Enter new password"
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="text-rose-600 text-sm mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((prev) => ({
                            ...prev,
                            confirmPassword: "",
                          }));
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-rose-600 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating password...
                    </div>
                  ) : (
                    "Update password"
                  )}
                </button>
                {error && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 text-center">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
