import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

type PageContextType = {
    title: ReactNode;
    setTitle: (title: ReactNode) => void;
    subTitle: ReactNode;
    setSubTitle: (subTitle: ReactNode) => void;
    actions: any;
    setActions: any;
    calendarDate: any;
    setCalendarDate: any;
    showBackButton: boolean;
    setShowBackButton: (show: boolean) => void;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState<string | ReactNode>("");
    const [showBackButton, setShowBackButton] = useState<boolean>(true);
    const [subTitle, setSubTitle] = useState<string | ReactNode>("");
    const [actions, setActions] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());

    return (
        <PageContext.Provider value={{ title, setTitle, showBackButton, setShowBackButton, subTitle, setSubTitle, actions, setActions, calendarDate, setCalendarDate }}>
            {children}
        </PageContext.Provider>
    );
};

export const usePageContext = (): PageContextType => {
    const context = useContext(PageContext);
    if (!context) throw new Error("usePageContext must be used within PageProvider");
    return context;
};
