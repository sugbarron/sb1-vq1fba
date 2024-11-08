"use client"

import { useQuery } from "@tanstack/react-query"
import { Calendar, Gift, UserCheck } from "lucide-react"
import { motion } from "framer-motion"

interface EmployeeHistoryProps {
  employeeId: string
}

interface HistoryItem {
  type: "event" | "raffle" | "attendance"
  title: string
  date: string
  description: string
}

export function EmployeeHistory({ employeeId }: EmployeeHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["employeeHistory", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/history`)
      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return <div>Cargando historial...</div>
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />
      case "raffle":
        return <Gift className="h-4 w-4" />
      case "attendance":
        return <UserCheck className="h-4 w-4" />
      default:
        return null
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "event":
        return "text-blue-500"
      case "raffle":
        return "text-purple-500"
      case "attendance":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {history?.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No hay actividad registrada
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
          {history?.map((item: HistoryItem, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 pb-4"
            >
              <div
                className={`absolute left-0 p-1 rounded-full bg-background border ${getColor(
                  item.type
                )}`}
              >
                {getIcon(item.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.title}</p>
                  <time className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}