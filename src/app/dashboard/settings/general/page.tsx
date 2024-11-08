"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"

const generalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string(),
  contactEmail: z.string().email("Invalid email address"),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
})

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>

export default function GeneralSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const { data: settings, isLoading } = useQuery({
    queryKey: ["generalSettings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/general")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      return response.json()
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings || {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      maintenanceMode: false,
      allowRegistration: true,
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettingsFormData) => {
      const response = await fetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update settings")
      }
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "General settings have been updated successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: GeneralSettingsFormData) => {
    setIsSubmitting(true)
    updateSettingsMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">
          Configure basic application settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Basic information about your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" {...register("siteName")} />
              {errors.siteName && (
                <p className="text-sm text-destructive mt-1">{errors.siteName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea id="siteDescription" {...register("siteDescription")} />
              {errors.siteDescription && (
                <p className="text-sm text-destructive mt-1">{errors.siteDescription.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" {...register("contactEmail")} />
              {errors.contactEmail && (
                <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system behavior and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode to prevent user access
                </p>
              </div>
              <Switch
                checked={settings?.maintenanceMode}
                onCheckedChange={(checked) => setValue("maintenanceMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings?.allowRegistration}
                onCheckedChange={(checked) => setValue("allowRegistration", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}