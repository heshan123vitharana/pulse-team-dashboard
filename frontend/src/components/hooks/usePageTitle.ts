import { useEffect, type ReactElement } from "react";
import { usePageContext } from "./PageContext";
import { useLocation } from "react-router-dom";

export const usePageTitle = (
    newTitle?: string | (() => ReactElement),
    subTitle?: string | ReactElement,
    deps: any[] = []
) => {
    const { setTitle, setSubTitle } = usePageContext();
    const location = useLocation();

    useEffect(() => {
        const resolvedTitle = typeof newTitle === "function" ? newTitle() : newTitle;
        setTitle(resolvedTitle ?? "Title Needs to be Provided");
        setSubTitle(subTitle ?? "Subtitle Needs to be Provided");

        return () => {
            setTitle("Title Needs to be Provided");
            setSubTitle("Subtitle Needs to be Provided");
        };
    }, [location.pathname, ...deps]);
};