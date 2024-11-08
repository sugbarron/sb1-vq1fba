"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Edit, UserCog } from "lucide-react"
import Link from "next/link"
import { EmployeeDialog } from "@/components/hr/employee-dialog"
import { useState } from "react"
import { motion } from "framer-motion"
import { EmployeeHistory } from "@/components/hr/employee-history"

export default function EmployeeDetailsPage() {
  const params = useParams()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch employee")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/hr">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles del Empleado</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Empleado
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCog className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">ID de Empleado</p>
                <p className="text-lg font-medium">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="text-lg font-medium">{employee.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="text-lg font-medium">{employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posición</p>
                <p className="text-lg font-medium">{employee.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                <p className="text-lg font-medium">
                  {new Date(employee.joinDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeHistory employeeId={params.id} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <EmployeeDialog
        employee={employee}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}