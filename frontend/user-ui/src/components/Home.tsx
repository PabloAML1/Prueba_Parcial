
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
    // Simulate logout
    onNavigate("login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-sm" />
              <h1 className="text-xl font-bold">Dashboard</h1>
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
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(" ")[0]}!</h2>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-sm" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "Project deployed", time: "2 minutes ago", status: "success" },
                { action: "User registered", time: "15 minutes ago", status: "info" },
                { action: "Security scan completed", time: "1 hour ago", status: "success" },
                { action: "Backup created", time: "3 hours ago", status: "info" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${item.status === "success" ? "bg-success" : "bg-primary"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <User className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">Add or remove users</p>
              </button>

              <button className="p-4 text-left rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <Settings className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">Configure your account</p>
              </button>

              <button className="p-4 text-left rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <Shield className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Security</p>
                <p className="text-xs text-muted-foreground">Review security settings</p>
              </button>

              <button className="p-4 text-left rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <HelpCircle className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium">Help</p>
                <p className="text-xs text-muted-foreground">Get support</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
