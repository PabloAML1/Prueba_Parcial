"use client"

import { useState } from "react"
import Login from "./components/Login"
import EmailVerify from "./components/EmailVerify"
import ResetPassword from "./components/ResetPassword"
import Home from "./components/Home"

type View = "login" | "emailVerify" | "resetPassword" | "home"

function App() {
  const [currentView, setCurrentView] = useState<View>("login")
  const [userEmail, setUserEmail] = useState("")

  const handleNavigate = (view: View, email?: string) => {
    setCurrentView(view)
    if (email) {
      setUserEmail(email)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentView === "login" && <Login onNavigate={handleNavigate} />}

      {currentView === "emailVerify" && <EmailVerify email={userEmail} onNavigate={handleNavigate} />}

      {currentView === "resetPassword" && <ResetPassword onNavigate={handleNavigate} />}

      {currentView === "home" && <Home onNavigate={handleNavigate} />}
    </div>
  )
}

export default App
