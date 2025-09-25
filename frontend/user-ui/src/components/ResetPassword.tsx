import type React from "react"
import { useState } from "react"
import { Mail, ArrowLeft, CheckCircle, Lock } from "lucide-react"

interface ResetPasswordProps {
  onNavigate: (view: "login" | "home") => void
}

export default function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [step, setStep] = useState<"email" | "code" | "newPassword" | "success">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrors({ email: "El correo es obligatorio" })
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "El correo no es válido" })
      return
    }

    setLoading(true)
    setErrors({})

    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setLoading(false)
    setStep("code")
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`reset-code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setErrors({ code: "Ingrese el código completo" })
      return
    }

    setLoading(true)
    setErrors({})
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    setStep("newPassword")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!newPassword) {
      newErrors.newPassword = "La contraseña es obligatoria"
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme su contraseña"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    setStep("success")
    setTimeout(() => onNavigate("login"), 3000)
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">¡Contraseña restablecida!</h1>
            <p className="text-muted-foreground mb-6">
              Su contraseña ha sido restablecida con éxito. Ahora puede iniciar sesión con su nueva contraseña.
            </p>
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botón de retroceso */}
        <button
          onClick={() => (step === "email" ? onNavigate("login") : setStep("email"))}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "email" ? "Volver al inicio de sesión" : "Atrás"}
        </button>

        <div className="bg-card border border-border rounded-lg p-8">
          {step === "email" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Restablecer contraseña</h1>
                <p className="text-muted-foreground">
                  Ingrese su correo electrónico y le enviaremos un código para restablecer su contraseña.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors({})
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                      placeholder="Ingrese su correo"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Enviando código...
                    </div>
                  ) : (
                    "Enviar código de restablecimiento"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Ingrese el código</h1>
                <p className="text-muted-foreground">Le hemos enviado un código de 6 dígitos a</p>
                <p className="font-medium text-foreground">{email}</p>
              </div>
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4 text-center">Ingrese el código de verificación</label>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`reset-code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    ))}
                  </div>
                  {errors.code && <p className="text-destructive text-sm mt-2 text-center">{errors.code}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verificando...
                    </div>
                  ) : (
                    "Verificar código"
                  )}
                </button>
              </form>
            </>
          )}

          {step === "newPassword" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Establecer nueva contraseña</h1>
                <p className="text-muted-foreground">Cree una nueva contraseña para su cuenta.</p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }))
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                      placeholder="Ingrese nueva contraseña"
                    />
                  </div>
                  {errors.newPassword && <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmar nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                      placeholder="Confirme nueva contraseña"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Actualizando contraseña...
                    </div>
                  ) : (
                    "Actualizar contraseña"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
