import React from "react";

type UseLoadingReturn = {
    isLoading: boolean;
    hideLoading: () => void;
    showLoading: () => void;
}

export const useLoading: () => UseLoadingReturn = () => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const hideLoading = () => setIsLoading(false);
    const showLoading = () => setIsLoading(true);

    return {
        isLoading,
        hideLoading,
        showLoading
    }
}