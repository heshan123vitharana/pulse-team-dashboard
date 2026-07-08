import { isEmpty } from "lodash"

/**
 * Custom hook to generate a key for SWR
 * @param key - The base key
 * @param suffixes - The suffixes to append to the key
 * @returns The SWR key
 */
export const useSwrKey = (key: string, ...suffixes: any[]) => {
    if (!key) return null

    if (isEmpty(suffixes)) return key

    if (suffixes.some(suffix => !suffix)) {
        // console.error("UseSwrKey Hook Error: SWR key suffixes have falsy values", suffixes)
        return null
    }

    return `${key}-${suffixes.join('-')}`
}