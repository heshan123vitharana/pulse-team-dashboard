import { useConfirmationDialog } from "@/components/hooks/useConfirmationDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useFrappeAuth } from "frappe-react-hooks"
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOut,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react"
import { useNavigate, type NavigateFunction } from "react-router-dom"
import { toast } from "sonner"
import { useState } from "react"
import ForgotPasswordDialog from "../../../pages/home/components/ChangePasswordDialog"
import useDisclosure from "@/components/hooks/useDisclosure"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { logout, currentUser } = useFrappeAuth(
    {},
    { realtimeUserValidation: true }
  )
  // let currentUser = {
  //     user: "Admin",
  //     user_type: "System User"
  // }
  const navigate: NavigateFunction = useNavigate()
  const { showConfirmationDialog } = useConfirmationDialog()
  const disclosure = useDisclosure()

  const onLogout = () => {
    showConfirmationDialog({
      title: "Confirm Logout",
      description: "Are you sure you want to logout?",
      icon: <LogOut />,
      size: "sm",
      onConfirm() {
        toast.promise(logout(), {
          loading: "Logging out...",
          success(res: any) {
            navigate("/", { replace: true })
            if (typeof window !== "undefined") {
              window.location.reload()
            }
            return "Logged out successfully!"
          },
          error: "Failed to log out!",
        })
      },
    })
  }
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {(currentUser as any)?.user}
                  </span>
                  <span className="truncate text-xs">
                    {(currentUser as any)?.user_type}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <SparklesIcon />
                  My Profile{" "}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => disclosure.onOpen()}
                  className="cursor-pointer"
                >
                  <BadgeCheckIcon />
                  Change Password
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <BellIcon />
                  Notification Preferences
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ForgotPasswordDialog disclosure={disclosure} />
    </>
  )
}
