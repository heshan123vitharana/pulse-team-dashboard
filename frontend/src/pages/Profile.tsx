import { type JSX } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield } from "lucide-react";
import authService from "@/api/auth";

export default function ProfilePage(): JSX.Element {
  const role = authService.getRole();
  const email = "user@example.com"; // In a real app, this would come from a /me endpoint or token payload
  const name = "Current User";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your current account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {email}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Full Name
              </span>
              <p className="font-medium">{name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Role
              </span>
              <p className="font-medium capitalize">{role || "Team Member"}</p>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button variant="outline">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
