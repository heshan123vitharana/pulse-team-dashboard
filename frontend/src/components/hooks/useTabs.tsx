import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useTabs = (defaultValue: string) => {
    const [value, setValue] = useState<string>(defaultValue);
    const [params, set] = useSearchParams()

    const tabParams = params.get("tab");

    const onValueChange = (tab: string) => {
        setValue(tab);
        set({ tab }, { replace: true })
    }

    useEffect(() => {
        setValue(tabParams || defaultValue)
    }, [tabParams])

    return { defaultValue, value, onValueChange };
}

(useTabs as any).displayName = "useTabs";
(useTabs as any).version = "1.0.1";