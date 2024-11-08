"use client"

import { useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    )

    scannerRef.current.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText)
          onScan(data)
        } catch (error) {
          toast({
            title: "Invalid QR Code",
            description: "This QR code is not valid for attendance.",
            variant: "destructive",
          })
          if (onError) onError("Invalid QR code format")
        }
      },
      (error) => {
        if (onError) onError(error)
      }
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [onScan, onError, toast])

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="w-full max-w-md mx-auto" />
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            if (scannerRef.current) {
              scannerRef.current.clear()
              scannerRef.current.render(
                (decodedText) => {
                  try {
                    const data = JSON.parse(decodedText)
                    onScan(data)
                  } catch (error) {
                    if (onError) onError("Invalid QR code format")
                  }
                },
                (error) => {
                  if (onError) onError(error)
                }
              )
            }
          }}
        >
          Reset Scanner
        </Button>
      </div>
    </div>
  )
}