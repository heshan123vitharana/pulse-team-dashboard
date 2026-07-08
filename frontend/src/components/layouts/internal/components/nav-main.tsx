import { PROJECT_CONFIG } from "@/components/project-config"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useFrappeGetCall } from "frappe-react-hooks"
import { get } from "lodash"
import { ChevronRightIcon, Home, icons } from "lucide-react"
import { Link } from "react-router-dom"

export interface CSideBar {
    label: string;
    icon: string;
    path: null;
    expanded: boolean;
    show: boolean;
    parent: boolean;
    access_restricted: boolean;
    disabled: boolean;
    allowed_roles: string[];
    children: CSideBarItem[];
}

export interface CSideBarItem {
    label: string;
    icon: string;
    path: string;
    show: boolean;
    disabled: boolean;
    allowed_roles: string[];
    access_restricted: boolean;
}


export function NavMain({ items }: {
    items: {
        title: string
        url: string
        icon?: React.ReactNode
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    const { data: _data } = useFrappeGetCall(
        "shadcn.api.sidebar.get",
        { app: PROJECT_CONFIG.base.app },
        "SHADCN-CONFIGURABLE-SIDEBAR",
        { keepPreviousData: true }
    )

    const sidebarConfig: CSideBar[] = get(_data, "message.sidebar", []) || []

    return (
        <SidebarGroup className="mt-0 pt-0">
            <SidebarMenu>
                {sidebarConfig.map((item: CSideBar) => (
                    <Collapsible
                        key={item.label}
                        asChild
                        defaultOpen={item.expanded}
                        className="group/collapsible"
                        disabled={item.disabled}
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.label}>
                                    <Icon name={item.icon} />
                                    <span>{item.label}</span>
                                    {item.children?.length > 0 && (
                                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    )}
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.children?.map((subItem: CSideBarItem) => (
                                        <SidebarMenuSubItem key={subItem.label}>
                                            <SidebarMenuSubButton asChild>
                                                <Link to={subItem.path}>
                                                    <Icon name={subItem.icon} />
                                                    <span>{subItem.label}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
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
