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
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Employee } from "@/types/employee"

const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  status: z.enum(["active", "inactive"]),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface EmployeeDialogProps {
  employee?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDialog({ employee, open, onOpenChange }: EmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeId: employee?.employeeId || "",
      name: employee?.name || "",
      email: employee?.email || "",
      department: employee?.department || "",
      position: employee?.position || "",
      status: employee?.status || "active",
    },
  })

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create employee")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"])
      toast({
        title: "Success",
        description: "Employee created successfully",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      })
    },
  })

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const response = await fetch(`/api/employees/${employee?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update employee")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"])
      toast({
        title: "Success",
        description: "Employee updated successfully",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: EmployeeFormData) => {
    setIsSubmitting(true)
    if (employee) {
      updateEmployeeMutation.mutate(data)
    } else {
      createEmployeeMutation.mutate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              {...register("employeeId")}
              disabled={!!employee}
            />
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...register("department")} />
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" {...register("position")} />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={employee?.status || "active"}
              onValueChange={(value) => register("status").onChange({
                target: { value, name: "status" }
              })}
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
                  {employee ? "Updating..." : "Creating..."}
                </>
              ) : (
                employee ? "Update Employee" : "Create Employee"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}