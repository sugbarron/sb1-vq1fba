import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigation } from "@/lib/navigation"
import { SidebarItem } from "./sidebar-item"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  theme?: string
  onThemeChange?: (theme: string) => void
}

export function Sidebar({ isOpen, setIsOpen, theme, onThemeChange }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 transition-all duration-300",
        "bg-zinc-900 text-zinc-100",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-zinc-800">
        <span className={cn(
          "text-xl font-bold text-primary transition-opacity duration-200",
          !isOpen && "opacity-0"
        )}>
          Enterprise Portal
        </span>
      </div>

      <nav className="mt-6 space-y-1 px-2">
        {navigation.map((item) => (
          <SidebarItem
            key={item.name}
            item={item}
            isOpen={isOpen}
          />
        ))}
      </nav>
    </aside>
  )
}