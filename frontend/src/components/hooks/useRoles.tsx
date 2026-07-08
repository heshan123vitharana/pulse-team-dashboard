import { useFrappeGetCall } from "frappe-react-hooks"
import { get } from "lodash"

interface UseRoles {
    roles: Array<String> | null,
    hasRoles: (r: Array<string>) => boolean,
    hasRole: (r: string) => boolean
}

/**
 * Hook to get roles of the current user
 * Once the roles are fetched, you can check if the user has a specific role or roles
 * shadcn (frappe app) version 1.4.9 or higher is required
 * 
 * @returns {UseRoles} roles, hasRoles, hasRole
 */
export const useRoles = (): UseRoles => {
    const { data, isLoading } = useFrappeGetCall("shadcn.api.auth.get_roles", {}, "SHADCN-GET-ROLES")
    const roles = get(data, "message", []) || []

    const hasRoles = (r: Array<string>) => {
        if (isLoading) return false;

        return r.some((role: string) => roles.includes(role))
    }

    const hasRole = (r: string) => {
        if (isLoading) return false;

        return roles.includes(r)
    }

    return {
        roles: isLoading ? null : roles,
        hasRoles,
        hasRole
    }
}

(useRoles as any).displayName = "useRoles";
(useRoles as any).version = "1.0.0";