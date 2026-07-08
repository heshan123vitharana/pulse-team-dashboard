import { useState } from "react"

export interface UseRequestData {
    args: any,
    swrKey: string
}

export const useRequestData = (): { payload: UseRequestData, setRequestData: any } => {
    const state = useState<UseRequestData>({ args: {}, swrKey: "" });

    return {
        payload: state[0],
        setRequestData: state[1]
    }
}

(useRequestData as any).displayName = "useRequestData";
(useRequestData as any).version = "1.0.0";