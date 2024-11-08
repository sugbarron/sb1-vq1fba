"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

interface RaffleWheelProps {
  spinning: boolean
  onSpinComplete?: () => void
}

export function RaffleWheel({ spinning, onSpinComplete }: RaffleWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (spinning && wheelRef.current) {
      // Create particles
      const particles = Array.from({ length: 20 }).map(() => {
        const particle = document.createElement("div")
        particle.className = "absolute w-2 h-2 rounded-full bg-primary"
        particlesRef.current?.appendChild(particle)
        return particle
      })

      // Wheel spin animation
      const timeline = gsap.timeline({
        onComplete: () => {
          onSpinComplete?.()
          // Clean up particles
          particles.forEach(p => p.remove())
        }
      })

      // Initial fast spin
      timeline.to(wheelRef.current, {
        rotation: "+=1440",
        duration: 2,
        ease: "power2.in",
      })

      // Slower spin with anticipation
      .to(wheelRef.current, {
        rotation: "+=720",
        duration: 1.5,
        ease: "power2.out",
      })

      // Glow effect
      timeline.fromTo(glowRef.current, 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1.2, duration: 0.5 },
        0
      )

      // Particle animations
      particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2
        const radius = 150
        const delay = i * 0.1

        gsap.set(particle, {
          x: Math.cos(angle) * radius + radius,
          y: Math.sin(angle) * radius + radius,
        })

        timeline.to(particle, {
          x: Math.cos(angle) * (radius + 100) + radius,
          y: Math.sin(angle) * (radius + 100) + radius,
          opacity: 0,
          duration: 1,
          delay,
          ease: "power2.out",
        }, 0)
      })
    }
  }, [spinning, onSpinComplete])

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      {/* Glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(255,79,0,0.2) 0%, rgba(255,79,0,0) 70%)",
        }}
      />

      {/* Wheel */}
      <div
        ref={wheelRef}
        className={cn(
          "absolute inset-0 border-8 border-primary rounded-full transition-transform",
          spinning && "cursor-not-allowed",
          !spinning && "hover:scale-105 cursor-pointer"
        )}
        style={{
          background: "conic-gradient(from 0deg, #FF4F00, #A7A9A9, #FF4F00)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-xl font-bold">
            {spinning ? "Drawing..." : "Ready"}
          </div>
        </div>
      </div>

      {/* Particles container */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 rounded-full border-4 border-white opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-primary" />
    </div>
  )
}</content>