import {
  Home,
  Users,
  FileText,
  Settings,
  Gift,
  Calendar,
  Leaf,
  BarChart,
  Building,
  UserCog,
  QrCode,
  Trophy,
  Menu,
  Shield,
  Mail,
  Bell,
  Database,
  Settings2,
} from "lucide-react"

export interface SubMenuItem {
  name: string
  href: string
  icon?: any
}

export interface MenuItem {
  name: string
  href?: string
  icon: any
  subItems?: SubMenuItem[]
}

export const navigation: MenuItem[] = [
  { 
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Recursos Humanos",
    icon: Building,
    subItems: [
      { name: "Empleados", href: "/dashboard/hr", icon: Users },
      { name: "Configuración", href: "/dashboard/hr/settings", icon: UserCog },
    ],
  },
  {
    name: "Eventos",
    icon: Calendar,
    subItems: [
      { name: "Lista de Eventos", href: "/dashboard/events", icon: Calendar },
      { name: "Check-in", href: "/dashboard/events/check-in", icon: QrCode },
      { name: "Invitados", href: "/dashboard/events/guests", icon: Users },
    ],
  },
  {
    name: "Sorteos",
    icon: Gift,
    subItems: [
      { name: "Lista de Sorteos", href: "/dashboard/raffles", icon: Gift },
      { name: "Premios", href: "/dashboard/raffles/prizes", icon: Trophy },
      { name: "Participantes", href: "/dashboard/raffles/participants", icon: Users },
    ],
  },
  {
    name: "Reportes",
    icon: FileText,
    subItems: [
      { name: "Asistencia", href: "/dashboard/reports/attendance", icon: BarChart },
      { name: "Participación", href: "/dashboard/reports/participation", icon: BarChart },
      { name: "Análisis", href: "/dashboard/reports/analytics", icon: BarChart },
    ],
  },
  { 
    name: "Sostenibilidad",
    href: "/dashboard/sustainability",
    icon: Leaf,
  },
  {
    name: "Configuración",
    icon: Settings,
    subItems: [
      { name: "General", href: "/dashboard/settings/general", icon: Settings2 },
      { name: "Menús", href: "/dashboard/settings/menus", icon: Menu },
      { name: "Seguridad", href: "/dashboard/settings/security", icon: Shield },
      { name: "Notificaciones", href: "/dashboard/settings/notifications", icon: Bell },
      { name: "Plantillas de Email", href: "/dashboard/settings/email-templates", icon: Mail },
      { name: "Base de Datos", href: "/dashboard/settings/database", icon: Database },
    ],
  },
]