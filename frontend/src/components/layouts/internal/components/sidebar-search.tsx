import { BellIcon, CalculatorIcon, CalendarIcon, ClipboardPasteIcon, CodeIcon, CopyIcon, CreditCardIcon, FileTextIcon, FolderIcon, FolderPlusIcon, HelpCircleIcon, Home, HomeIcon, icons, ImageIcon, InboxIcon, LayoutGridIcon, ListIcon, PlusIcon, ScissorsIcon, Search, SettingsIcon, TrashIcon, UserIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    SidebarGroup,
    SidebarGroupContent
} from "@/components/ui/sidebar"
import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useFrappeGetCall } from "frappe-react-hooks"
import { PROJECT_CONFIG } from "@/components/project-config"
import { get } from "lodash"
import type { CSideBar } from "./nav-main"
import { Kbd } from "@/components/ui/kbd"
import { useNavigate } from "react-router-dom"

export function SidebarSearch({ ...props }: React.ComponentProps<"form">) {
    const navigate = useNavigate()
    const [open, setOpen] = React.useState(false)
    const { data: _data } = useFrappeGetCall(
        "shadcn.api.sidebar.get",
        { app: PROJECT_CONFIG.base.app },
        "SHADCN-CONFIGURABLE-SIDEBAR",
        { keepPreviousData: true }
    )

    const sidebarConfig: CSideBar[] = get(_data, "message.sidebar", []) || []

    useHotkeys(
        'cmd+k, ctrl+k, meta+k',
        () => {
            setOpen(true)
        },
        { preventDefault: true }
    )

    return (
        <SidebarGroup className="py-0">
            <SidebarGroupContent className="relative">
                <Label htmlFor="search" className="sr-only">
                    Search
                </Label>
                <div className="relative w-full max-w-md">
                    <Input
                        readOnly
                        onClick={() => setOpen(true)}
                        placeholder="Search..."
                        className="pr-20 pl-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                        ⌘K
                    </span>
                </div>
                <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                <div className="flex flex-col gap-4">
                    <CommandDialog open={open} onOpenChange={setOpen}>
                        <Command>
                            <CommandInput placeholder="Type a command or search..." />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                {sidebarConfig.map((group) => {
                                    if (group.children.length === 0) return null

                                    return (
                                        <>
                                            <CommandGroup heading={group.label}>
                                                {group.children.map((item) => (
                                                    <CommandItem onSelect={() => navigate(item.path)}>
                                                        <Icon name={item.icon} />
                                                        <span>{item.label}</span>
                                                        <CommandShortcut>
                                                            <Kbd className="pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:w-3 [&_svg:not([class*='size-'])]:h-3">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-corner-down-left">
                                                                    <polyline points="9 10 4 15 9 20"></polyline>
                                                                    <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                                                                </svg>
                                                            </Kbd>
                                                        </CommandShortcut>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )
                                })}

                            </CommandList>
                        </Command>
                    </CommandDialog>
                </div>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

const Icon = ({ name, color, size }: any) => {
    const LucideIcon = (icons as any)[name];

    if (!LucideIcon) {
        return <Home className="mr-2 h-4 w-4" color={color} size={size} />;
    }

    return <LucideIcon className="mr-2 h-4 w-4" color={color} size={size} />;
};
