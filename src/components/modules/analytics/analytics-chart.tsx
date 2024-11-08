"use client"

import { useEffect, useRef } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface AnalyticsChartProps {
  data: any[]
  period: string
}

export function AnalyticsChart({ data, period }: AnalyticsChartProps) {
  const chartRef = useRef<ChartJS>(null)

  const processData = (rawData: any[]): ChartData<"line"> => {
    const dates = getDatesArray(period)
    const datasets = rawData.map((item) => {
      const actionData = new Map(
        item.data.map((d: any) => [d.date, d.count])
      )

      return {
        label: item._id,
        data: dates.map((date) => actionData.get(date) || 0),
        borderColor: getRandomColor(),
        tension: 0.4,
      }
    })

    return {
      labels: dates,
      datasets,
    }
  }

  const getDatesArray = (period: string): string[] => {
    const dates: string[] = []
    const today = new Date()
    let days: number

    switch (period) {
      case "24h":
        days = 1
        break
      case "7d":
        days = 7
        break
      case "30d":
        days = 30
        break
      default:
        days = 7
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  const getRandomColor = () => {
    const colors = [
      "#FF4F00",
      "#00A3FF",
      "#00FF8C",
      "#FFB800",
      "#FF00E5",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="w-full h-[400px]">
      <Line
        ref={chartRef}
        data={processData(data)}
        options={options}
      />
    </div>
  )
}