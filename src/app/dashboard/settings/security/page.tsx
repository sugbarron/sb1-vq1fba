"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const securitySettingsSchema = z.object({
  passwordMinLength: z.number().min(8),
  passwordRequireUppercase: z.boolean(),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSymbols: z.boolean(),
  sessionTimeout: z.number().min(5),
  maxLoginAttempts: z.number().min(1),
  twoFactorAuth: z.boolean(),
  twoFactorMethod: z.enum(["email", "authenticator"]),
})

type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>

export default function SecuritySettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const { data: settings, isLoading } = useQuery({
    queryKey: ["securitySettings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/security")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      return response.json()
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settings || {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      twoFactorMethod: "email",
    },
  })

  const twoFactorAuth = watch("twoFactorAuth")

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SecuritySettingsFormData) => {
      const response = await fetch("/api/settings/security", {
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
        description: "Security settings have been updated successfully.",
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

  const onSubmit = (data: SecuritySettingsFormData) => {
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
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Configure security and authentication settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>
              Configure password requirements and complexity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="8"
                {...register("passwordMinLength", { valueAsNumber: true })}
              />
              {errors.passwordMinLength && (
                <p className="text-sm text-destructive mt-1">{errors.passwordMinLength.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Require Uppercase Letters</Label>
                <Switch
                  checked={settings?.passwordRequireUppercase}
                  onCheckedChange={(checked) => setValue("passwordRequireUppercase", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Require Numbers</Label>
                <Switch
                  checked={settings?.passwordRequireNumbers}
                  onCheckedChange={(checked) => setValue("passwordRequireNumbers", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Require Special Characters</Label>
                <Switch
                  checked={settings?.passwordRequireSymbols}
                  onCheckedChange={(checked) => setValue("passwordRequireSymbols", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session & Authentication</CardTitle>
            <CardDescription>
              Configure session and login settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                {...register("sessionTimeout", { valueAsNumber: true })}
              />
              {errors.sessionTimeout && (
                <p className="text-sm text-destructive mt-1">{errors.sessionTimeout.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                min="1"
                {...register("maxLoginAttempts", { valueAsNumber: true })}
              />
              {errors.maxLoginAttempts && (
                <p className="text-sm text-destructive mt-1">{errors.maxLoginAttempts.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require two-factor authentication for all users
                  </p>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={(checked) => setValue("twoFactorAuth", checked)}
                />
              </div>

              {twoFactorAuth && (
                <div>
                  <Label>Two-Factor Method</Label>
                  <Select
                    defaultValue={settings?.twoFactorMethod}
                    onValueChange={(value: "email" | "authenticator") => setValue("twoFactorMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="authenticator">Authenticator App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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