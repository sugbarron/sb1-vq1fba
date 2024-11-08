"use client"

import { useState } from "react"
import { Employee } from "@/types/employee"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowUpDown } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { EmployeeDialog } from "./employee-dialog"
import { DeleteEmployeeDialog } from "./delete-employee-dialog"
import { EmployeeFilters } from "./employee-filters"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface EmployeeListProps {
  employees?: Employee[]
  isLoading: boolean
}

type SortField = "name" | "employeeId" | "department" | "position"
type SortOrder = "asc" | "desc"

export function EmployeeList({ employees, isLoading }: EmployeeListProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  })
  const [sortConfig, setSortConfig] = useState<{
    field: SortField
    order: SortOrder
  }>({
    field: "name",
    order: "asc",
  })

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Error al eliminar empleado")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"])
      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al eliminar empleado",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDialogOpen(true)
  }

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee._id)
      setDeleteDialogOpen(false)
      setSelectedEmployee(null)
    }
  }

  const handleSort = (field: SortField) => {
    setSortConfig({
      field,
      order:
        sortConfig.field === field && sortConfig.order === "asc"
          ? "desc"
          : "asc",
    })
  }

  const departments = Array.from(new Set(employees?.map((e) => e.department)))

  const filteredAndSortedEmployees = employees
    ?.filter((employee) => {
      const matchesSearch =
        !filters.search ||
        employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(filters.search.toLowerCase())

      const matchesDepartment =
        !filters.department || employee.department === filters.department

      const matchesStatus =
        !filters.status || employee.status === filters.status

      return matchesSearch && matchesDepartment && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      if (sortConfig.order === "asc") {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <>
      <div className="space-y-4">
        <EmployeeFilters
          departments={departments}
          onFiltersChange={setFilters}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("employeeId")} className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>ID Empleado</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Nombre</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("department")} className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Departamento</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("position")} className="cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Posición</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedEmployees?.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/employees/${employee._id}`}
                      className="text-primary hover:underline"
                    >
                      {employee.name}
                    </Link>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                    >
                      {employee.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(employee)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EmployeeDialog
        employee={selectedEmployee}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedEmployee(null)
        }}
      />

      <DeleteEmployeeDialog
        employee={selectedEmployee}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </>
  )
}