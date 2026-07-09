import { type JSX, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Plus,
} from "lucide-react";

import authService from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── DashboardLayout Component ───────────────────────────────────────────────

export default function DashboardLayout(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = authService.getRole();
  const userInitials = "U"; // Default initials, would come from actual user profile in a real app
  
  const isManager = role?.toLowerCase() === "manager";

  // Dynamically generate navigation items based on role
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(isManager
      ? [{ name: "Team Reports", href: "/team-reports", icon: BarChart3 }]
      : [
          { name: "Submit Report", href: "/submit-report", icon: Plus },
          { name: "My Reports", href: "/my-reports", icon: BarChart3 }
        ]),
    { name: "Projects", href: "/projects", icon: FolderKanban },
  ];

  const handleLogout = (): void => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              isActive
                ? "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-svh w-full bg-slate-50/50 dark:bg-background">
      {/* ─── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden border-r bg-background lg:block lg:w-64 lg:shrink-0">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-lg tracking-tight">Pulse</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid items-start px-4 text-sm font-medium gap-1">
              <NavLinks />
            </nav>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
              <div className="flex h-14 items-center border-b px-6">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-lg tracking-tight">Pulse</span>
                </Link>
              </div>
              <nav className="grid gap-2 p-4 text-lg font-medium">
                <NavLinks onClick={() => setMobileMenuOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1" />

          {role && (
            <span className="hidden md:inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
              {role}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ─── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
