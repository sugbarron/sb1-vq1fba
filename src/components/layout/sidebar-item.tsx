import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { MenuItem } from "@/lib/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarItemProps {
  item: MenuItem
  isOpen: boolean
}

export function SidebarItem({ item, isOpen }: SidebarItemProps) {
  const pathname = usePathname()
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)

  const isActive = item.href 
    ? pathname === item.href
    : item.subItems?.some(subItem => pathname === subItem.href)

  const Icon = item.icon

  if (!item.subItems) {
    return (
      <Link
        href={item.href || "#"}
        className={cn(
          "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
          isActive
            ? "bg-zinc-800 text-primary"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
          !isOpen && "justify-center"
        )}
      >
        <Icon className={cn(
          "h-5 w-5",
          isActive && "text-primary"
        )} />
        {isOpen && (
          <span className={cn(
            "ml-3 transition-opacity duration-200",
            !isOpen && "opacity-0"
          )}>
            {item.name}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
        className={cn(
          "w-full flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
          isActive
            ? "bg-zinc-800 text-primary"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
          !isOpen && "justify-center"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive && "text-primary"
        )} />
        {isOpen && (
          <>
            <span className="ml-3">{item.name}</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform duration-200",
                isSubmenuOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && isSubmenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-4 pl-4 border-l border-zinc-800">
              {item.subItems.map((subItem) => {
                const isSubItemActive = pathname === subItem.href
                const SubIcon = subItem.icon

                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                      isSubItemActive
                        ? "text-primary"
                        : "text-zinc-400 hover:text-zinc-100"
                    )}
                  >
                    {SubIcon && (
                      <SubIcon className={cn(
                        "h-4 w-4 mr-3",
                        isSubItemActive && "text-primary"
                      )} />
                    )}
                    {subItem.name}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}