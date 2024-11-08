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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Employee } from "@/types/employee"

const employeeSchema = z.object({
  employeeId: z.string().min(1, "ID de empleado es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento es requerido"),
  position: z.string().min(1, "Posición es requerida"),
  status: z.enum(["active", "inactive"]),
  raffleEligible: z.boolean(),
  raffleExclusionReason: z.string().optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface EmployeeDialogProps {
  employee?: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDialog({ employee, open, onOpenChange }: EmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeId: employee?.employeeId || "",
      name: employee?.name || "",
      email: employee?.email || "",
      department: employee?.department || "",
      position: employee?.position || "",
      status: employee?.status || "active",
      raffleEligible: employee?.raffleEligible ?? true,
      raffleExclusionReason: employee?.raffleExclusionReason || "",
    },
  })

  const raffleEligible = watch("raffleEligible")

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
        title: "Éxito",
        description: "Empleado creado correctamente",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al crear empleado",
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
        title: "Éxito",
        description: "Empleado actualizado correctamente",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al actualizar empleado",
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
            {employee ? "Editar Empleado" : "Agregar Nuevo Empleado"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="employeeId">ID de Empleado</Label>
            <Input
              id="employeeId"
              {...register("employeeId")}
              disabled={!!employee}
            />
            {errors.employeeId && (
              <p className="text-sm text-destructive mt-1">{errors.employeeId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="department">Departamento</Label>
            <Input id="department" {...register("department")} />
            {errors.department && (
              <p className="text-sm text-destructive mt-1">{errors.department.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="position">Posición</Label>
            <Input id="position" {...register("position")} />
            {errors.position && (
              <p className="text-sm text-destructive mt-1">{errors.position.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              defaultValue={employee?.status || "active"}
              onValueChange={(value) => register("status").onChange({
                target: { value, name: "status" }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="raffleEligible">Elegible para Rifas</Label>
            <Switch
              id="raffleEligible"
              checked={raffleEligible}
              onCheckedChange={(checked) => setValue("raffleEligible", checked)}
            />
          </div>

          {!raffleEligible && (
            <div>
              <Label htmlFor="raffleExclusionReason">Razón de Exclusión</Label>
              <Textarea
                id="raffleExclusionReason"
                {...register("raffleExclusionReason")}
                placeholder="Explique por qué el empleado no es elegible para participar en rifas"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {employee ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                employee ? "Actualizar Empleado" : "Crear Empleado"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}