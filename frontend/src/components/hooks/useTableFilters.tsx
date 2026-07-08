import { flatten, unflatten } from 'flat';
import { type FormikValues } from "formik";
import { get, isArray, isEmpty, toInteger } from "lodash";
import { useEffect, useMemo, useState, type JSX } from "react";
// @ts-ignore
import qs from 'qs';
import { useLocation, useSearchParams } from "react-router-dom";

export type CustomTableFilterType = {
    fieldName: string;
    label: string,
    element: JSX.Element,
    filterCondition: [string, string | number | null];
}

export type TableFilterType = {
    filters: CustomTableFilterType[]
    minFilterCount?: number
    filterFormik: FormikValues,
    automaticFilterTriggers?: boolean
    swrKeyPrefix: string,
    setRequestData: any
    initialArgs: any,
    paginationOptions?: Array<number>,
    disableParamBasedFiltering?: boolean,
    disablePageSelector?: boolean
}

// Encoder function
export const encode = (initialArgs: any) => {
    return new URLSearchParams(flatten(initialArgs)).toString();;
};

// Decoder function
export const decode = (searchParams: any) => {
    const parsedParams = qs.parse(searchParams, { ignoreQueryPrefix: true });
    return unflatten(parsedParams);
};

export const useTableFilters = (config?: TableFilterType) => {
    if (!config) {
        return { setPageCount: null, onFilterClear: null };
    }

    const [params, setParams] = useSearchParams()
    const [renderedTableCount, setRenderedTableCount] = useState<any>(null)
    const [pageSize, setPageSize] = useState<number>(15)
    const location = useLocation();

    const {
        filters,
        filterFormik: formik,
        disableParamBasedFiltering = false,
        swrKeyPrefix,
        initialArgs,
        automaticFilterTriggers = true
    } = config;
    const limit = useMemo(() => initialArgs?.limit ? initialArgs.limit : pageSize, [JSON.stringify(initialArgs.limit)])
    const initArgs = useMemo(() => ({ ...initialArgs, limit: toInteger(limit) }), [JSON.stringify(limit)])
    const existingParams = useMemo(() => {
        const queryString = location.search;
        const existingParams = new URLSearchParams(queryString);
        const paramKeys = Array.from(existingParams.keys());

        let p: any = {}

        paramKeys.forEach((key) => {
            if (key == "args") return;
            p[key] = params.get(key)

        })

        return p;
    }, [location.search, location.pathname])

    const [args, setArgs] = useState<any>({
        ...initArgs,
    })

    const paramArgs = useMemo(() => {
        const pArgs = params.get('args')

        if (!pArgs) return {}
        let decodedParamArgs: any = decode(pArgs)

        if (decodedParamArgs?.hasOwnProperty("limit")) {
            decodedParamArgs["limit"] = toInteger(decodedParamArgs.limit);
        }

        if (decodedParamArgs?.hasOwnProperty("pagesize")) {
            decodedParamArgs["pagesize"] = toInteger(decodedParamArgs.pagesize);
        }

        return decodedParamArgs
    }, [JSON.stringify(params.get('args'))])

    const hasParams = useMemo(() => {
        if (isEmpty(paramArgs)) return false

        return true
    }, [JSON.stringify(paramArgs)])

    useEffect(() => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const elements = document.querySelectorAll('[id^="tbl"]');
            setRenderedTableCount(elements.length);
        }
    }, [])

    useEffect(() => {
        setArgs((prev: any) => {
            const newFilters: any = [];

            // arranging filters
            filters.forEach((filter: CustomTableFilterType) => {
                const { fieldName, filterCondition: [field, operation] } = filter;
                const fieldValue: any = formik.values[fieldName];

                if (fieldValue || fieldValue === 0 || fieldValue === false) {
                    if (operation === "like") {
                        newFilters.push([field, operation, `%${fieldValue}%`]);
                    } else {
                        newFilters.push([field, operation, fieldValue]);
                    }
                }
            });

            const res = newFilters.length > 0 ? { ...prev, filters: newFilters } : initArgs

            // Directly set the filter args to setFilter only if the automaticFilterTrigger is enabled
            if (automaticFilterTriggers) {
                setFiltersWithArgs(res)
            }
            return res
        });
    }, [JSON.stringify(formik.values)]);

    useEffect(() => {
        if (hasParams) {
            setFiltersWithArgs(paramArgs)
            setArgs(paramArgs)

            const ps = get(paramArgs, "pagesize")

            if (ps) {
                setPageSize(ps)
            }
        }

        // Update formik based on params
        if (!isEmpty((get(paramArgs, 'filters', []) || []))) {
            (get(paramArgs, 'filters', []) || []).forEach((paramFilter: Array<any>) => {
                if (!paramFilter || !isArray(paramFilter)) return;

                if (paramFilter.length != 3) return;

                const [paramField, c, paramFieldValue] = paramFilter;

                if (paramField.includes(".")) {
                    const actualParamField = paramField.split(".")[1];
                    if (get(formik, ["values", actualParamField]) != paramFieldValue) {
                        formik.setFieldValue(
                            actualParamField,
                            typeof paramFieldValue === 'string' ?
                                paramFieldValue.replace(/%/g, '') :
                                paramFieldValue);
                    }
                }

                if (get(formik, ["values", paramField]) !== c) {
                    formik.setFieldValue(
                        paramField,
                        typeof paramFieldValue === 'string' ?
                            paramFieldValue.replace(/%/g, '') :
                            paramFieldValue);
                }
            })
        }
    }, [JSON.stringify(paramArgs), hasParams, renderedTableCount])

    useEffect(() => {
        if (automaticFilterTriggers == false) {
            setFilters()
        }
    }, [])

    const setFilters = (setInitialUrlParams: boolean = false) => {
        // Allowing 100 ticks to update internal arg state
        setTimeout(() => {
            handleRequestData(args);
            if (setInitialUrlParams) {
                setUrlParams(args)
            }
        }, 100)
    }

    const setFiltersWithArgs = (incomingArgs: any) => {
        // Commented 2025/04/18
        // Time out removed to handle realtime text input fields which are not yet updated in formik
        // setTimeout(() => {
        //     setUrlParams(incomingArgs)
        //     handleRequestData(incomingArgs)
        // }, 200)

        setUrlParams(incomingArgs)
        handleRequestData(incomingArgs)
    }

    const fetchNext = (currentPage: any) => {
        const nextPage = (currentPage + 1) * pageSize
        const newArgs = { ...args, limit: toInteger(nextPage), "pagesize": pageSize }

        handleRequestData(newArgs)
        setUrlParams(newArgs)
        setArgs(newArgs)
    }

    const fetchPrevious = (currentPage: any) => {
        const nextPage = (currentPage - 1) * pageSize
        const newArgs = { ...args, limit: toInteger(nextPage), "pagesize": pageSize }

        handleRequestData(newArgs)
        setUrlParams(newArgs)
        setArgs(newArgs)
    }

    const setTablePageSize = (size: number, currentPage: any) => {
        setPageSize(size)
        const nextPage = (currentPage * size)
        const newArgs = { ...args, limit: toInteger(nextPage), pagesize: size }

        handleRequestData(newArgs)
        setUrlParams(newArgs)
        setArgs(newArgs)
    }

    const onFilterClear = () => {
        const ps = get(paramArgs, "pagesize")

        if (ps) {
            setPageSize(ps)

            setArgs({ ...initArgs, limit: toInteger(ps), pagesize: ps });

            setTimeout(() => {
                handleRequestData({ ...initArgs, limit: toInteger(ps), pagesize: ps })
            }, 10)

            setUrlParams({ ...initArgs, limit: toInteger(ps), pagesize: ps })
        } else {
            setArgs(initArgs);

            setTimeout(() => {
                handleRequestData(initArgs)
            }, 10)

            setUrlParams(initArgs)
        }

        formik.resetForm();
    }

    const handleRequestData = (incomingArgs: any) => {
        if (config) {
            config.setRequestData({
                args: incomingArgs,
                swrKey: swrKeyPrefix + JSON.stringify(incomingArgs)
            })
        }
    }

    const setUrlParams = (incomingArgs: any) => {
        if (disableParamBasedFiltering == true || renderedTableCount != 1) return;

        setParams({ ...existingParams, "args": encode(incomingArgs) }, { replace: true })
    }

    return {
        onFilterClear,
        setFilters,
        pageSize,
        fetchNext,
        fetchPrevious,
        setPageSize: setTablePageSize
    }
}

(useTableFilters as any).displayName = "useTableFilters";
(useTableFilters as any).version = "1.0.2";
