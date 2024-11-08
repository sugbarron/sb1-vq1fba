"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Employee } from "@/types/employee"
import gsap from "gsap"
import confetti from "canvas-confetti"

interface WinnerDisplayProps {
  winner: Employee
  timeLeft: number
  onClaim: () => void
}

export function WinnerDisplay({ winner, timeLeft, onClaim }: WinnerDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timeLeftRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Entrance animation
      gsap.from(containerRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      })

      // Celebrate with confetti
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF4F00', '#A7A9A9'],
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF4F00', '#A7A9A9'],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [])

  useEffect(() => {
    if (timeLeftRef.current) {
      // Pulse animation when time is running low
      if (timeLeft <= 10) {
        gsap.to(timeLeftRef.current, {
          scale: 1.1,
          color: "#EF4444",
          duration: 0.3,
          yoyo: true,
          repeat: -1,
        })
      }
    }
  }, [timeLeft])

  return (
    <div
      ref={containerRef}
      className="mt-8 p-8 bg-white rounded-lg shadow-lg text-center relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(#FF4F00 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />
      </div>

      <div className="relative">
        <h2 className="text-3xl font-bold mb-6 text-primary">
          🎉 Winner! 🎉
        </h2>

        <div className="mb-6 space-y-2">
          <p className="text-2xl font-semibold">{winner.name}</p>
          <p className="text-gray-600">{winner.department}</p>
        </div>

        <div className="mb-6">
          <div
            ref={timeLeftRef}
            className={`text-lg font-medium ${
              timeLeft <= 10 ? "text-red-500" : "text-gray-700"
            }`}
          >
            Time to claim: {timeLeft}s
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        <Button
          onClick={onClaim}
          className="w-full text-lg py-6 bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
        >
          Claim Prize
        </Button>
      </div>
    </div>
  )
}</content>