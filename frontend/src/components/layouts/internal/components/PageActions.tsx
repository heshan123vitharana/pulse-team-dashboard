import * as React from "react";

import type { BadgeColorType } from "@/components/common/types/common.type";
import { usePageContext } from "@/components/hooks/PageContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COLOR_SCHEMAS } from "@/lib/general_utils";
import {
    DotsHorizontalIcon,
    ReloadIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";

// Types
type MenuAction = {
    text: string;
    onClick: () => void;
    isDisabled?: boolean;
};

type PageHeaderGeneralAction = {
    text: string;
    onClick: () => void;
    isDisabled?: boolean;
    buttonColorScheme?: BadgeColorType;
    buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
    isLoading?: boolean;
    hide?: boolean;
};

type PageHeaderMenuAction = {
    items: MenuAction[];
    isDisabled?: boolean;
    hide?: boolean;
};

type PageHeaderCustomMenuAction = {
    cmp: React.ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    hide?: boolean;
};

type PageHeaderAction =
    | PageHeaderGeneralAction
    | PageHeaderMenuAction
    | PageHeaderCustomMenuAction;

// Type guards
const isMenuAction = (action: PageHeaderAction): action is PageHeaderMenuAction =>
    "items" in action;

const isCustomAction = (action: PageHeaderAction): action is PageHeaderCustomMenuAction =>
    "cmp" in action;

export const PageActions = () => {
    const { actions } = usePageContext();

    const actionMarkup = React.useMemo(() =>
        actions.map((action: PageHeaderAction, index: number) => {
            if (action?.hide) return null;

            if (isMenuAction(action)) {
                return (
                    <DropdownMenu key={index}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-[31px] w-[33px] p-0">
                                <span className="sr-only">Open menu</span>
                                <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {action.items.map((item, i) => (
                                <DropdownMenuItem
                                    key={i}
                                    disabled={item.isDisabled}
                                    onSelect={item.onClick}
                                    className="capitalize"
                                >
                                    {item.text}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }

            if (isCustomAction(action)) {
                return (
                    <div
                        key={index}
                        onClick={action.isDisabled ? undefined : action.onClick}
                        className={clsx(action.isDisabled && "cursor-not-allowed opacity-50")}
                    >
                        {action.cmp}
                    </div>
                );
            }

            return (
                <Button
                    key={index}
                    size="sm"
                    className={clsx(
                        "cursor-pointer",
                        action.buttonColorScheme && COLOR_SCHEMAS[action.buttonColorScheme],
                        (action.isLoading || action.isDisabled) && "cursor-not-allowed",
                        action.buttonColorScheme && action.buttonVariant !== "outline" && "border-none"
                    )}
                    disabled={action.isDisabled || action.isLoading}
                    variant={action.buttonVariant || "outline"}
                    onClick={action.onClick}
                >
                    {action.isLoading && (
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {action.text}
                </Button>
            );
        }), [actions]
    );

    return (
        <div className="flex items-center gap-2 text-sm">
            {actionMarkup}
        </div>
    );
};

export default PageActions;