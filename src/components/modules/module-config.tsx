"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ModuleConfigProps {
  moduleId: string
}

export function ModuleConfig({ moduleId }: ModuleConfigProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [settings, setSettings] = useState<any[]>([])

  const { data: config, isLoading } = useQuery({
    queryKey: ["moduleConfig", moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/modules/${moduleId}/config`)
      if (!response.ok) {
        throw new Error("Failed to fetch module config")
      }
      return response.json()
    },
    onSuccess: (data) => {
      setSettings(data.settings || [])
    },
  })

  const updateConfigMutation = useMutation({
    mutationFn: async (newSettings: any[]) => {
      const response = await fetch(`/api/modules/${moduleId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      })
      if (!response.ok) {
        throw new Error("Failed to update module config")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["moduleConfig", moduleId])
      toast({
        title: "Success",
        description: "Module configuration updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update module configuration",
        variant: "destructive",
      })
    },
  })

  const handleSettingChange = (index: number, value: any) => {
    const newSettings = [...settings]
    newSettings[index] = {
      ...newSettings[index],
      value,
    }
    setSettings(newSettings)
  }

  const handleSave = () => {
    updateConfigMutation.mutate(settings)
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
      {settings.map((setting, index) => (
        <div key={setting.key} className="space-y-2">
          <Label>
            {setting.label}
            {setting.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {setting.description && (
            <p className="text-sm text-gray-500">{setting.description}</p>
          )}

          {setting.type === "string" && !setting.options && (
            <Input
              value={setting.value || ""}
              onChange={(e) => handleSettingChange(index, e.target.value)}
              required={setting.required}
            />
          )}

          {setting.type === "number" && (
            <Input
              type="number"
              value={setting.value || ""}
              onChange={(e) => handleSettingChange(index, Number(e.target.value))}
              required={setting.required}
            />
          )}

          {setting.type === "boolean" && (
            <Switch
              checked={setting.value || false}
              onCheckedChange={(checked) => handleSettingChange(index, checked)}
            />
          )}

          {setting.options && (
            <Select
              value={setting.value || ""}
              onValueChange={(value) => handleSettingChange(index, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {setting.options.map((option: any) => (
                  <SelectItem
                    key={typeof option === "object" ? option.value : option}
                    value={typeof option === "object" ? option.value : option}
                  >
                    {typeof option === "object" ? option.label : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={updateConfigMutation.isLoading}
        className="mt-6"
      >
        {updateConfigMutation.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Configuration"
        )}
      </Button>
    </div>
  )
}