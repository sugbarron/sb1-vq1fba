"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        theme={theme}
        onThemeChange={setTheme}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={sidebarOpen ? "open" : "closed"}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "transition-all duration-300",
            sidebarOpen ? "ml-64" : "ml-20"
          )}
        >
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            user={session.user}
            theme={theme}
            onThemeChange={setTheme}
          />
          <main className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}