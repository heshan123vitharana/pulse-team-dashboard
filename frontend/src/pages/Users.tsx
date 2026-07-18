import { type JSX, useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import authService, { type User, type RegisterData, type Role } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number>(3); // Default to Team Member (id: 3)

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        authService.getUsers(),
        authService.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Could not load users. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setFormError("All fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const payload: RegisterData = {
        name: name.trim(),
        email: email.trim(),
        password,
        role_id: roleId,
      };

      await authService.register(payload);
      
      setIsDialogOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRoleId(3);
      
      await fetchUsersAndRoles();
    } catch (err: any) {
      console.error("Failed to add user:", err);
      const detail = err?.response?.data?.detail;
      setFormError(typeof detail === 'string' ? detail : "Failed to create user. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setRoleId(3);
      setFormError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their roles.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new account. You must provide them with the initial password.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                    {formError}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="jane.doe@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Initial Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> All Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-md">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 rounded-tr-md text-right">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-muted-foreground">#{user.id}</td>
                      <td className="px-4 py-3 font-semibold">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.role?.role_name === "Administrator" 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : user.role?.role_name === "Project Manager"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        }`}>
                          {user.role?.role_name || `Role ${user.role_id}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden flex flex-col divide-y divide-border border-t sm:border-none">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex flex-col gap-2 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span className="text-muted-foreground font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">#{user.id}</span>
                      {user.name}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.role?.role_name === "Administrator" 
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : user.role?.role_name === "Project Manager"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }`}>
                      {user.role?.role_name || `Role ${user.role_id}`}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No users found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
