import { type JSX, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail } from "lucide-react";
import authService, { type User as AuthUser } from "@/api/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProfilePage(): JSX.Element {
  const role = authService.getRole() || "Team Member";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        setUser(data);
        setEditName(data.name);
        setEditEmail(data.email);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Name and email cannot be empty");
      return;
    }
    
    setSaving(true);
    try {
      const updatedUser = await authService.updateMe({ name: editName, email: editEmail });
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
    setIsEditing(false);
  };

  const email = user?.email || authService.getUserEmail() || "user@example.com"; 
  const name = user?.name || "Loading...";

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
          {loading ? (
             <div className="space-y-4">
               <Skeleton className="h-16 w-16 rounded-full" />
               <Skeleton className="h-6 w-[200px]" />
               <Skeleton className="h-4 w-[250px]" />
             </div>
          ) : (
            <>
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-16 w-16 bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200 rounded-full flex items-center justify-center font-bold text-2xl uppercase shrink-0">
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

              {isEditing ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={editEmail} 
                      onChange={(e) => setEditEmail(e.target.value)} 
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={role} disabled />
                    <p className="text-xs text-muted-foreground">Contact your manager to change your role.</p>
                  </div>
                </div>
              ) : (
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
                      <User className="h-4 w-4" />
                      Role
                    </span>
                    <p className="font-medium">{role}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        {!loading && (
          <CardFooter className="border-t px-6 py-4 flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
