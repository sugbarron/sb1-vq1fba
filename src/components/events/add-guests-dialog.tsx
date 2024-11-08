"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  type: z.enum(["employee", "external"]),
  employeeId: z.string().optional(),
})

type GuestFormData = z.infer<typeof guestSchema>

interface AddGuestsDialogProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddGuestsDialog({ eventId, open, onOpenChange }: AddGuestsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      return response.json()
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      type: "external",
    },
  })

  const guestType = watch("type")

  const addGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      const response = await fetch(`/api/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to add guest")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["eventGuests", eventId])
      toast({
        title: "Success",
        description: "Guest added successfully",
      })
      reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add guest",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: GuestFormData) => {
    setIsSubmitting(true)
    addGuestMutation.mutate(data)
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees?.find((e: any) => e._id === employeeId)
    if (employee) {
      setValue("employeeId", employeeId)
      setValue("name", employee.name)
      setValue("email", employee.email)
      setValue("organization", employee.department)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Guest</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Guest Type</Label>
            <Select
              defaultValue="external"
              onValueChange={(value: "employee" | "external") => setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select guest type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="external">External Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {guestType === "employee" ? (
            <div>
              <Label>Select Employee</Label>
              <Select onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((employee: any) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...register("phone")} />
              </div>

              <div>
                <Label htmlFor="organization">Organization (optional)</Label>
                <Input id="organization" {...register("organization")} />
              </div>
            </>
          )}

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
                  Adding...
                </>
              ) : (
                "Add Guest"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}