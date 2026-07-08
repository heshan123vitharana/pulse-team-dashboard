import { useFrappeGetCall } from "frappe-react-hooks";
import { filter, find, get } from "lodash";
import { Lock } from "lucide-react";
import { useLocation } from "react-router-dom";

const pathMatcher = (path: string, pathname: string) => {
    if (path.endsWith("/")) {
        return path == (pathname + "/")
    }

    if (pathname.endsWith("/")) {
        return pathname == (path + "/")
    }

    if (path === pathname) {
        return true;
    }

    return false;
}

const getHighlyRestrictedPath = (paths: any[]) => {
    if (!paths) {
        return null;
    }

    if (paths.length == 0) {
        return null;
    }

    if (paths.length > 1) {
        return find(paths, (path) => path.access_restricted == true)
    }

    return paths[0];
}

export const PageProvider = ({ children, appName = "base-app" }: { children: any, appName?: string }) => {
    const { data, isLoading } = useFrappeGetCall("shadcn.api.routes.get", { app: appName }, "SHADCN-ROUTES")
    const { pathname } = useLocation()

    const routes = get(data, "message", []) || [];
    const paths = filter(routes, (route) => pathMatcher(route.route, pathname));
    const path = getHighlyRestrictedPath(paths);

    if (isLoading) {
        return <></>
    }

    if (path && "access_restricted" in path && path?.access_restricted == true) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center">
                    <Lock size={70} className="animate-bounce text-primary" />
                    <h1 className="text-3xl text-black font-bold">Access Denied</h1>
                    <p className="text-gray-500">You do not have permission to access this page</p>
                    {path?.origin && <p className="text-gray-400">Origin: {path?.origin}</p>}
                </div>
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

PageProvider.displayName = "PageProvider";
(PageProvider as any).version = "1.0.1";