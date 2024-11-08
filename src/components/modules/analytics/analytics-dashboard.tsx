"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AnalyticsChart } from "./analytics-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AnalyticsDashboardProps {
  moduleId: string
}

export function AnalyticsDashboard({ moduleId }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("7d")

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["moduleAnalytics", moduleId, period],
    queryFn: async () => {
      const response = await fetch(
        `/api/modules/${moduleId}/analytics?period=${period}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }
      return response.json()
    },
  })

  const calculateTotalActions = () => {
    if (!analytics) return 0
    return analytics.reduce((total: number, item: any) => {
      return total + item.data.reduce((sum: number, d: any) => sum + d.count, 0)
    }, 0)
  }

  const calculateTopAction = () => {
    if (!analytics) return null
    let maxCount = 0
    let topAction = null

    analytics.forEach((item: any) => {
      const total = item.data.reduce((sum: number, d: any) => sum + d.count, 0)
      if (total > maxCount) {
        maxCount = total
        topAction = item._id
      }
    })

    return { action: topAction, count: maxCount }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalActions = calculateTotalActions()
  const topAction = calculateTopAction()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant={period === "24h" ? "default" : "outline"}
            onClick={() => setPeriod("24h")}
          >
            24h
          </Button>
          <Button
            variant={period === "7d" ? "default" : "outline"}
            onClick={() => setPeriod("7d")}
          >
            7 days
          </Button>
          <Button
            variant={period === "30d" ? "default" : "outline"}
            onClick={() => setPeriod("30d")}
          >
            30 days
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {topAction?.action || "No actions"}
            </div>
            <div className="text-sm text-gray-500">
              {topAction?.count || 0} times
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={analytics || []} period={period} />
        </CardContent>
      </Card>
    </div>
  )
}