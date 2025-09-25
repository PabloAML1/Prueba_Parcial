import { useState } from "react"
import { LogOut, User, Settings, Shield, Bell, HelpCircle } from "lucide-react"

interface HomeProps {
  onNavigate: (view: "login") => void
}

export default function Home({ onNavigate }: HomeProps) {
  const [user] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/diverse-user-avatars.png",
  })

  const handleLogout = () => {
    onNavigate("login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Encabezado */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-sm" />
              <h1 className="text-xl font-bold">Panel de Clínica</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido, {user.name.split(" ")[0]}!</h2>
          <p className="text-muted-foreground">Aquí puedes ver la actividad de tu clínica hoy.</p>
        </div>

      </main>
    </div>
  )
}
