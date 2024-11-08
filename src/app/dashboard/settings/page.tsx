"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Menu,
  Users,
  Settings2,
  Bell,
  Shield,
  Mail,
  Database,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const settingsSections = [
  {
    title: "Menu Management",
    description: "Configure navigation menus and submenus",
    icon: Menu,
    href: "/dashboard/settings/menus",
    color: "text-blue-500",
  },
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    icon: Users,
    href: "/dashboard/settings/users",
    color: "text-green-500",
  },
  {
    title: "General Settings",
    description: "Configure general application settings",
    icon: Settings2,
    href: "/dashboard/settings/general",
    color: "text-orange-500",
  },
  {
    title: "Notifications",
    description: "Configure email and system notifications",
    icon: Bell,
    href: "/dashboard/settings/notifications",
    color: "text-purple-500",
  },
  {
    title: "Security",
    description: "Security and authentication settings",
    icon: Shield,
    href: "/dashboard/settings/security",
    color: "text-red-500",
  },
  {
    title: "Email Templates",
    description: "Manage email templates and content",
    icon: Mail,
    href: "/dashboard/settings/email-templates",
    color: "text-yellow-500",
  },
  {
    title: "Database",
    description: "Database configuration and maintenance",
    icon: Database,
    href: "/dashboard/settings/database",
    color: "text-cyan-500",
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={section.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    "bg-background border-2",
                    section.color
                  )}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center">
                      {section.title}
                      <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}