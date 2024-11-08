"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string(),
  icon: z.string().min(1, "Icon is required"),
  path: z.string().min(1, "Path is required"),
})

type ModuleFormData = z.infer<typeof moduleSchema>

interface ModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModuleDialog({ open, onOpenChange }: ModuleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  })

  const createModuleMutation = useMutation({
    mutationFn: async (data: ModuleFormData) => {
      const response = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create module")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["modules"])
      toast({
        title: "Success",
        description: "Module created successfully",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: ModuleFormData) => {
    createModuleMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Internal Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
            <Input id="icon" {...register("icon")} />
            {errors.icon && (
              <p className="text-sm text-red-500">{errors.icon.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="path">Path</Label>
            <Input id="path" {...register("path")} />
            {errors.path && (
              <p className="text-sm text-red-500">{errors.path.message}</p>
            )}
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
              disabled={createModuleMutation.isLoading}
            >
              {createModuleMutation.isLoading ? "Creating..." : "Create Module"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}