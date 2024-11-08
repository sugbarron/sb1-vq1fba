"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface EmployeeFiltersProps {
  departments: string[]
  onFiltersChange: (filters: {
    search: string
    department: string
    status: string
  }) => void
}

export function EmployeeFilters({ departments, onFiltersChange }: EmployeeFiltersProps) {
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const [status, setStatus] = useState("")

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFiltersChange({ search: value, department, status })
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    onFiltersChange({ search, department: value, status })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFiltersChange({ search, department, status: value })
  }

  const handleReset = () => {
    setSearch("")
    setDepartment("")
    setStatus("")
    onFiltersChange({ search: "", department: "", status: "" })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={department} onValueChange={handleDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center"
          disabled={!search && !department && !status}
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}