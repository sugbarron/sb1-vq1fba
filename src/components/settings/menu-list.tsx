import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuListProps {
  menus: any[]
  isLoading: boolean
  onEdit: (menu: any) => void
}

export function MenuList({ menus, isLoading, onEdit }: MenuListProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete menu")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["menus"])
      toast({
        title: "Menu deleted",
        description: "The menu has been deleted successfully.",
      })
    },
  })

  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleDelete = async (menuId: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      await deleteMenuMutation.mutateAsync(menuId)
    }
  }

  const renderMenuItems = (items: any[], level = 0) => {
    return items.map(menu => {
      const hasChildren = menu.children?.length > 0
      const isExpanded = expandedMenus.includes(menu._id)
      const IconComponent = Icons[menu.icon as keyof typeof Icons] || Icons.Circle

      return (
        <>
          <TableRow key={menu._id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <div style={{ width: level * 24 }} />
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    onClick={() => toggleExpand(menu._id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <IconComponent className="h-4 w-4 mr-2" />
                {menu.name}
              </div>
            </TableCell>
            <TableCell>{menu.href || "-"}</TableCell>
            <TableCell>{menu.order}</TableCell>
            <TableCell>
              <Badge variant={menu.status === "active" ? "default" : "secondary"}>
                {menu.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(menu)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(menu._id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          {hasChildren && isExpanded && renderMenuItems(menu.children, level + 1)}
        </>
      )
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderMenuItems(menus)}
        </TableBody>
      </Table>
    </div>
  )
}