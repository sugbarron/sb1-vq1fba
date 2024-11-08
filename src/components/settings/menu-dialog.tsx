"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import * as Icons from "lucide-react"

const menuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  href: z.string().optional(),
  order: z.number().min(0),
  parentId: z.string().optional(),
  roles: z.array(z.string()),
  status: z.enum(["active", "inactive"]),
})

type MenuFormData = z.infer<typeof menuSchema>

interface MenuDialogProps {
  menu?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuDialog({ menu, open, onOpenChange }: MenuDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: menus } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const response = await fetch("/api/menus")
      if (!response.ok) {
        throw new Error("Failed to fetch menus")
      }
      return response.json()
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: menu?.name || "",
      icon: menu?.icon || "Circle",
      href: menu?.href || "",
      order: menu?.order || 0,
      parentId: menu?.parentId?._id || "",
      roles: menu?.roles || ["user"],
      status: menu?.status || "active",
    },
  })

  const createMenuMutation = useMutation({
    mutationFn: async (data: MenuFormData) => {
      const response = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create menu")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["menus"])
      toast({
        title: "Success",
        description: "Menu created successfully",
      })
      reset()
      onOpenChange(false)
    },
  })

  const updateMenuMutation = useMutation({
    mutationFn: async (data: MenuFormData) => {
      const response = await fetch(`/api/menus/${menu._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update menu")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["menus"])
      toast({
        title: "Success",
        description: "Menu updated successfully",
      })
      reset()
      onOpenChange(false)
    },
  })

  const onSubmit = (data: MenuFormData) => {
    setIsSubmitting(true)
    if (menu) {
      updateMenuMutation.mutate(data)
    } else {
      createMenuMutation.mutate(data)
    }
  }

  const iconNames = Object.keys(Icons)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {menu ? "Edit Menu" : "Add New Menu"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select
              defaultValue={menu?.icon || "Circle"}
              onValueChange={(value) => setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {iconNames.map((iconName) => (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center">
                      {React.createElement(Icons[iconName as keyof typeof Icons], {
                        className: "h-4 w-4 mr-2",
                      })}
                      {iconName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="href">Path (optional)</Label>
            <Input id="href" {...register("href")} />
          </div>

          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              min="0"
              {...register("order", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="parentId">Parent Menu (optional)</Label>
            <Select
              defaultValue={menu?.parentId?._id || ""}
              onValueChange={(value) => setValue("parentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent menu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {menus?.map((m: any) => (
                  <SelectItem key={m._id} value={m._id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={menu?.status || "active"}
              onValueChange={(value: "active" | "inactive") => setValue("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {menu ? "Updating..." : "Creating..."}
                </>
              ) : (
                menu ? "Update Menu" : "Create Menu"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}