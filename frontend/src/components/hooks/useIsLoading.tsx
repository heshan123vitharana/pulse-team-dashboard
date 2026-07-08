/**
 * useIsLoading hook determines if any of the provided loading state.
 *
 * @param params - An array of boolean values.
 * @returns loading - A boolean indicating whether at least one of the parameters is true.
 */

const useIsLoading = (...params: Array<boolean>): boolean => {
    return params.some((param: boolean): boolean => param)
}

useIsLoading.displayName = "useIsLoading";
(useIsLoading as any).version = "1.0.0";

export default useIsLoading