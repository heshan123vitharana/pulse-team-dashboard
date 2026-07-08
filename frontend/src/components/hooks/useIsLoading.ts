/**
 * useIsLoading hook determines if any of the provided loading state.
 *
 * @param params - An array of boolean values.
 * @returns loading - A boolean indicating whether at least one of the parameters is true.
 */

const useIsLoading = (...params: Array<boolean>): boolean => {
    return params.some((param: boolean): boolean => param)
}

export default useIsLoading