import { SocketContainer } from "@/components/common/socket-container/SocketContainer"
import { PageTitleProvider, usePageContext } from "@/components/hooks/PageContext"
import { AppSidebar } from "@/components/layouts/internal/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import clsx from "clsx"
import { useFrappeAuth } from "frappe-react-hooks"
import { get } from "lodash"
import { ArrowLeft, LoaderIcon } from "lucide-react"
import { useEffect } from "react"
import { Outlet, useNavigate, type NavigateFunction } from "react-router-dom"
import AppBreadcrumbs from "./components/AppBreadcrumbs"
import PageActions from "./components/PageActions"
import { PageProvider } from "@/components/hooks/PageProvider"

export default function InternalLayout() {
    const navigate: NavigateFunction = useNavigate()
    const { currentUser, isLoading, isValidating } = useFrappeAuth({ revalidateIfStale: true, }, { realtimeUserValidation: true })

    const user = get(currentUser, ["user"], "Guest")
    const isPageLoading = (isLoading || isValidating)

    useEffect(() => {
        if (isPageLoading) {
            if (user && user !== 'Guest') { }
            else {
                navigate("/", { replace: true })
                // window.location.reload()
            }
        }
    }, [user])

    if (!isPageLoading && user !== 'Guest') {
        // if (true) {
        return (
            <PageTitleProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <header className="border-b py-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
                            <div className="flex items-center gap-2 px-3">
                                <SidebarTrigger className="-ml-1" />
                                <Separator
                                    orientation="vertical"
                                    className=""
                                />
                                <BackBtn />
                                <AppBreadcrumbs />
                                <div className="ml-auto">
                                    <PageActions />
                                </div>
                            </div>
                        </header>

                        <div className="flex flex-1 flex-col px-3 pt-3">
                            <PageProvider appName="base-app">
                                <SocketContainer>
                                    <Outlet />
                                </SocketContainer>
                            </PageProvider>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </PageTitleProvider>
        )
    }

    return (
        <div className="h-dvh w-full flex justify-center items-center">
            <LoaderIcon className="animate-spin w-5 h-5" size={"md"} />
        </div>
    )
}

const BackBtn = () => {
    const { showBackButton } = usePageContext()
    const navigate = useNavigate()

    if (!showBackButton) return null;

    return (
        <Button
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={clsx("h-7 w-7 cursor-pointer")}
            onClick={() => navigate(-1)}
        >
            <ArrowLeft className="text-gray-700 dark:text-gray-200" size={17} />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
}
