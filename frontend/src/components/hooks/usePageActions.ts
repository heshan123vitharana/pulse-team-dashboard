// usePageTitle.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { BadgeColorType } from "../common/types/common.type";
import { usePageContext } from "./PageContext";

type PageHeaderGeneralAction = {
    text: string;
    onClick: () => void;
    isDisabled?: boolean;
    buttonColorScheme?: BadgeColorType;
    buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    isLoading?: boolean;
    hide?: boolean;
}


type MenuAction = {
    text: string;
    onClick: () => void;
    isDisabled?: boolean;
}

type PageHeaderMenuAction = {
    isDisabled?: boolean;
    items: Array<MenuAction>;
    hide?: boolean;
}

type PageHeaderCustomMenuAction = {
    cmp: React.ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    hide?: boolean;
}

export type PageHeaderActions = Array<PageHeaderGeneralAction | PageHeaderMenuAction | PageHeaderCustomMenuAction>;

export const usePageActions = (actions: PageHeaderActions) => {
    const { setActions } = usePageContext();
    const location = useLocation();

    useEffect(() => {
        if (actions) {
            setActions(actions);
        } else {
            setActions([]);
        }

        return () => {
            setActions([]);
        };
    }, [actions, location.pathname, setActions]);
};