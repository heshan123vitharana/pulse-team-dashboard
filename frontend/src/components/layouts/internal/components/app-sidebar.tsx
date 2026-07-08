"use client"

import * as React from "react"

import { NavMain } from "@/components/layouts/internal/components/nav-main"
import { NavUser } from "@/components/layouts/internal/components/nav-user"
import { TeamSwitcher } from "@/components/layouts/internal/components/team-switcher"
import { PROJECT_CONFIG } from "@/components/project-config"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { useFrappeGetCall } from "frappe-react-hooks"
import { get } from "lodash"
import { AudioLinesIcon, BookOpenIcon, BotIcon, FrameIcon, GalleryVerticalEndIcon, MapIcon, PieChartIcon, Settings2Icon, TerminalIcon, TerminalSquareIcon } from "lucide-react"
import { SidebarSearch } from "./sidebar-search"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: (
                <GalleryVerticalEndIcon
                />
            ),
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: (
                <AudioLinesIcon
                />
            ),
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: (
                <TerminalIcon
                />
            ),
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: (
                <TerminalSquareIcon
                />
            ),
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: (
                <BotIcon
                />
            ),
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: (
                <BookOpenIcon
                />
            ),
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: (
                <Settings2Icon
                />
            ),
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: (
                <FrameIcon
                />
            ),
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: (
                <PieChartIcon
                />
            ),
        },
        {
            name: "Travel",
            url: "#",
            icon: (
                <MapIcon
                />
            ),
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open } = useSidebar()
    const { data: _data } = useFrappeGetCall(
        "shadcn.api.sidebar.get",
        { app: PROJECT_CONFIG.base.app },
        "SHADCN-CONFIGURABLE-SIDEBAR",
        { keepPreviousData: true }
    )

    const sidebarConfig = get(_data, "message.sidebar", []) || []
    const text = get(_data, "message.text", "")
    const logo = get(_data, "message.logo")

    const versions = ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"]

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
                {open && <SidebarSearch />}
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
