import React from "react";

export type UseLoading = {
    isLoading: boolean;
    hideLoading: () => void;
    showLoading: () => void;
}

export const useLoading: () => UseLoading = () => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const hideLoading = () => setIsLoading(false);
    const showLoading = () => setIsLoading(true);

    return {
        isLoading,
        hideLoading,
        showLoading
    }
}

(useLoading as any).displayName = "useLoading";
(useLoading as any).version = "1.0.1";