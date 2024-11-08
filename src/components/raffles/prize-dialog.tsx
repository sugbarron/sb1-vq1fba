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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const prizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  tier: z.enum(["platinum", "gold", "silver", "bronze"]),
  value: z.string().transform((val) => Number(val)),
})

type PrizeFormData = z.infer<typeof prizeSchema>

interface PrizeDialogProps {
  raffleId: string
  prize?: {
    _id: string
    name: string
    description: string
    tier: "platinum" | "gold" | "silver" | "bronze"
    value: number
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TIERS = [
  { value: "platinum", label: "Platinum", color: "bg-slate-300" },
  { value: "gold", label: "Gold", color: "bg-yellow-300" },
  { value: "silver", label: "Silver", color: "bg-gray-300" },
  { value: "bronze", label: "Bronze", color: "bg-amber-600" },
]

export function PrizeDialog({ raffleId, prize, open, onOpenChange }: PrizeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PrizeFormData>({
    resolver: zodResolver(prizeSchema),
    defaultValues: {
      name: prize?.name || "",
      description: prize?.description || "",
      tier: prize?.tier || "bronze",
      value: prize?.value?.toString() || "0",
    },
  })

  const createPrizeMutation = useMutation({
    mutationFn: async (data: PrizeFormData) => {
      const response = await fetch(`/api/raffles/${raffleId}/prizes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to create prize")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffle", raffleId])
      toast({
        title: "Success",
        description: "Prize created successfully",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prize",
        variant: "destructive",
      })
    },
  })

  const updatePrizeMutation = useMutation({
    mutationFn: async (data: PrizeFormData) => {
      const response = await fetch(`/api/raffles/${raffleId}/prizes/${prize?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update prize")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffle", raffleId])
      toast({
        title: "Success",
        description: "Prize updated successfully",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prize",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: PrizeFormData) => {
    setIsSubmitting(true)
    if (prize) {
      updatePrizeMutation.mutate(data)
    } else {
      createPrizeMutation.mutate(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prize ? "Edit Prize" : "Add New Prize"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Prize Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tier">Tier</Label>
            <Select
              defaultValue={prize?.tier || "bronze"}
              onValueChange={(value) => setValue("tier", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {TIERS.map((tier) => (
                  <SelectItem
                    key={tier.value}
                    value={tier.value}
                    className="flex items-center"
                  >
                    <span className={`w-3 h-3 rounded-full mr-2 ${tier.color}`} />
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              {...register("value")}
            />
            {errors.value && (
              <p className="text-sm text-red-500">{errors.value.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {prize ? "Updating..." : "Creating..."}
                </>
              ) : (
                prize ? "Update Prize" : "Create Prize"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}