"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { EmployeeList } from "@/components/hr/employee-list"
import { EmployeeDialog } from "@/components/hr/employee-dialog"
import { Plus, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function HRPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      return response.json()
    },
  })

  const activeEmployees = employees?.filter((e: any) => e.status === "active")?.length || 0
  const totalEmployees = employees?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Empleados</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Empleado
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empleados Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">
                de {totalEmployees} empleados totales
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Actividad
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalEmployees ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                empleados activos
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <EmployeeList employees={employees} isLoading={isLoading} />
      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}