import { Module } from "@/types/module"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

interface ModuleListProps {
  modules?: Module[]
  isLoading: boolean
}

export function ModuleList({ modules, isLoading }: ModuleListProps) {
  const { data: session } = useSession()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules?.map((module) => {
        const IconComponent = Icons[module.icon as keyof typeof Icons] as LucideIcon

        return (
          <Link href={`/dashboard${module.path}`} key={module._id}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    <span>{module.displayName}</span>
                  </CardTitle>
                  <Badge variant={module.status === "active" ? "default" : "secondary"}>
                    {module.status}
                  </Badge>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {session?.user.role === "admin" ? (
                    <div>Admins: {module.adminRoles.map(admin => admin.name).join(", ")}</div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}