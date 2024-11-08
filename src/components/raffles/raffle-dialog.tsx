"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const raffleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  eventId: z.string().optional(),
})

type RaffleFormData = z.infer<typeof raffleSchema>

interface RaffleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RaffleDialog({ open, onOpenChange }: RaffleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch("/api/events")
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      return response.json()
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<RaffleFormData>({
    resolver: zodResolver(raffleSchema),
  })

  const createRaffleMutation = useMutation({
    mutationFn: async (data: RaffleFormData) => {
      const response = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create raffle")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffles"])
      toast({
        title: "Éxito",
        description: "Sorteo creado correctamente",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al crear el sorteo",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: RaffleFormData) => {
    setIsSubmitting(true)
    createRaffleMutation.mutate(data)
  }

  // Filter events that don't have a raffle yet and are not completed
  const availableEvents = events?.filter((event: any) => 
    !event.raffleId && event.status !== "completed"
  ) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Sorteo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {availableEvents.length > 0 && (
            <div>
              <Label>Evento Asociado</Label>
              <Select onValueChange={(value) => setValue("eventId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar evento" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.map((event: any) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name} ({new Date(event.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Opcional: Asociar el sorteo a un evento existente
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Sorteo"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}