"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { MenuList } from "@/components/settings/menu-list"
import { MenuDialog } from "@/components/settings/menu-dialog"
import { Plus } from "lucide-react"

export default function MenuSettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<any>(null)

  const { data: menus, isLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const response = await fetch("/api/menus")
      if (!response.ok) {
        throw new Error("Failed to fetch menus")
      }
      return response.json()
    },
  })

  const handleEdit = (menu: any) => {
    setSelectedMenu(menu)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Menús</h1>
        <Button onClick={() => {
          setSelectedMenu(null)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Menú
        </Button>
      </div>

      <MenuList 
        menus={menus} 
        isLoading={isLoading} 
        onEdit={handleEdit}
      />

      <MenuDialog
        menu={selectedMenu}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}