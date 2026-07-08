Table

import {
    ChevronDownIcon
} from "@radix-ui/react-icons"
import {
    type CellContext,
    type ColumnDef,
    type ColumnFiltersState,
    type HeaderContext,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table"
import * as React from "react"

import { type TableFilterType, useTableFilters } from "@/components/hooks/useTableFilters"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { htmlSanitizer } from "@/lib/general_utils"
import { useMediaQuery } from "@uidotdev/usehooks"
import { cx } from "class-variance-authority"
import clsx from "clsx"
import { get, isEmpty, toInteger } from "lodash"
import { Download, FilterIcon, Loader } from "lucide-react"
import moment from "moment"
import ReactDOMServer from 'react-dom/server'
import { useDownloadExcel } from "react-export-table-to-excel"
import './style.css'

interface CustomTableProps {
    heading?: string
    selection?: boolean
    columns: ColumnDef<any>[];
    data: any[];
    pagination?: boolean,
    showColumnFilters?: boolean,
    searchable?: boolean
    isLoading?: boolean
    summaryRow?: React.JSX.Element
    filterConfig?: TableFilterType
    setSelectedRows?: React.Dispatch<React.SetStateAction<any>>
    totalResults?: any
    id?: string,
    disableExport?: boolean
    containerClassName?: string
    placeholder?: string
    virtualized?: boolean,
    disableMobileView?: boolean
    mobileViewConfig?: MobileViewConfig,
    columnVisibiltyProps?: VisibilityState
}

export interface MobileViewConfig {
    labelValueSeparator?: string
    lineSeparator?: boolean
    labelContainerClassName?: string
    valueContainerClassName?: string
    lineContainerClassName?: string
    lineSpacing?: 'start' | 'between' | 'around' | 'evenly' | 'center'
}

const defaultMobileViewConfig: MobileViewConfig = {
    lineSeparator: false,
    labelValueSeparator: "",
    lineContainerClassName: "",
    labelContainerClassName: "",
    valueContainerClassName: "",
    lineSpacing: "between",
}

const lineSpacingMapper = {
    start: "justify-start",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
    center: "justify-center",
}

export const CustomTable = React.forwardRef((props: CustomTableProps, ref: React.ForwardedRef<any>) => {
    const {
        heading,
        filterConfig,
        disableExport = true,
        virtualized = false,
        selection = false,
        placeholder = "No results",
        containerClassName,
        columns,
        setSelectedRows,
        data,
        pagination = true,
        isLoading,
        summaryRow,
        showColumnFilters = true,
        searchable = true,
        id,
        disableMobileView = false,
        mobileViewConfig = defaultMobileViewConfig,
        columnVisibiltyProps = undefined
    } = props;

    const isMobile: boolean = useMediaQuery("only screen and (max-width : 568px)");

    const globalFilterState = React.useState('')
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const tableRef = React.useRef(null)

    if (filterConfig) {
        filterConfig.paginationOptions = (
            filterConfig?.paginationOptions &&
            !isEmpty(filterConfig.paginationOptions)) ?
            filterConfig.paginationOptions :
            [15, 50, 100, 1000]
    }

    const {
        onFilterClear,
        setFilters,
        pageSize,
        fetchNext = () => { },
        fetchPrevious = () => { },
        setPageSize = () => { }
    } = useTableFilters(filterConfig)

    const tableDataCount = (data || []).length
    const totalResultCount = React.useMemo(() => {
        if (!isEmpty(data) && data?.length > 0) {
            return get(data, [0, "__count"], 0)
        }

        return 0
    }, [JSON.stringify(data)])
    const currentPage: any = React.useMemo(() => {
        if (!tableDataCount) return 0

        return Math.ceil(tableDataCount / (pageSize || 1))
    }, [tableDataCount, pageSize])
    const maxPageCount = React.useMemo(() => {
        if (!totalResultCount) return 0

        return Math.ceil(totalResultCount / (pageSize || 1))
    }, [totalResultCount, pageSize])


    if (selection && columns?.length > 0 && columns[0]?.id != 'select') {
        columns.unshift(
            {
                id: "select",
                header: ({ table }: HeaderContext<any, any>) => (
                    <div className="flex flex-col justify-center">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && "indeterminate")
                            }
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }: CellContext<any, any>) => (
                    <div className="flex flex-col justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            }
        )
    }

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: globalFilterState[1],
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            globalFilter: globalFilterState[0],
            sorting,
            columnFilters,
            columnVisibility: columnVisibiltyProps ? columnVisibiltyProps : columnVisibility,
            rowSelection,
        },
        manualPagination: true,
    })

    const selectedRows = table.getFilteredSelectedRowModel();

    React.useEffect(() => {
        if (setSelectedRows) {
            setSelectedRows(selectedRows.rows)
        }
    }, [selectedRows])

    const tableId = id ? "tbl-" + id : "tbl"

    const { onDownload: onExport } = useDownloadExcel({
        currentTableRef: tableRef.current,
        filename: `${moment(Date())}`,
        sheet: 'Sheet 1'
    })

    const onPageSizeChange = (v: any) => {
        setPageSize(toInteger(v.target.value), currentPage)
    }

    return (
        <div className="w-full">
            <Header
                disableExport={disableExport || Boolean(ref)}
                isLoading={isLoading}
                isEmpty={isEmpty(data)}
                onExport={onExport}
                setFilters={setFilters}
                onFilterClear={onFilterClear}
                filterConfig={filterConfig}
                searchable={searchable}
                showColumnFilters={showColumnFilters}
                heading={heading}
                table={table}
                globalFilterState={globalFilterState} />

            {(isMobile && !disableMobileView) && (
                <div id={tableId} className="flex flex-col gap-3">
                    {isLoading && (
                        <div className="p-3 py-6 bg-white">
                            <Loader className="mx-auto animate-spin" />
                        </div>
                    )}

                    {(isEmpty(table.getRowModel().rows) && !isLoading) && (
                        <div className="border p-6 flex flex-col rounded-md shadow-sm bg-white">
                            <p className="text-center text-gray-500 text-[13px]">No results.</p>
                        </div>
                    )}

                    {
                        table.getRowModel().rows.map((row) => (
                            <div
                                className={clsx("border p-3 rounded-md shadow-sm bg-white", mobileViewConfig?.lineContainerClassName && mobileViewConfig.lineContainerClassName)}
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"} >
                                {row.getVisibleCells().map((cell, i: number) => (
                                    <div key={cell.id} className={clsx("w-full py-0.5 flex items-center", mobileViewConfig?.lineSeparator && "border-b last:border-none", mobileViewConfig?.lineSpacing && lineSpacingMapper[mobileViewConfig?.lineSpacing])}>
                                        <div className={clsx(mobileViewConfig?.labelContainerClassName && mobileViewConfig.labelContainerClassName)}>
                                            {htmlSanitizer(ReactDOMServer.renderToString(flexRender(
                                                table.getHeaderGroups()[0].headers[i].column.columnDef.header as any,
                                                table.getHeaderGroups()[0].headers[i].getContext()
                                            ) as any))}
                                        </div>

                                        {mobileViewConfig?.labelValueSeparator && <span className="mx-1">{mobileViewConfig.labelValueSeparator}</span>}

                                        <div className={clsx(mobileViewConfig?.valueContainerClassName && mobileViewConfig.valueContainerClassName)}>
                                            {React.createElement(cell.column.columnDef.cell as any, cell.getContext())}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    }
                </div>
            )}

            {!isMobile && (
                <div className={clsx("rounded-md border overflow-x-auto", containerClassName && containerClassName)}>
                    <table className="custom-table" id={tableId} ref={ref || tableRef}>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th className={cx("first:pl-2 last:pr-2",
                                                virtualized && " border-gray-500 sticky z-20 top-0 left-0 bg-gray-100"
                                            )} key={header.id}>
                                                <div className="font-medium text-[14px] text-black dark:text-white">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </div>
                                            </th>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-gray-500 text-[13px] loading-fade">
                                        <Loader className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}

                            {(table.getRowModel().rows?.length && !isLoading) ? (
                                table.getRowModel().rows.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-[14px]">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>

                                        ))}
                                    </TableRow>
                                ))) : null}

                            {(!isLoading && isEmpty(data)) ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-gray-500 text-[13px] placeholder-fade">
                                        {placeholder}
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {(summaryRow && table.getRowModel().rows?.length && !isLoading) ? <>{summaryRow}</> : null}
                        </TableBody>
                    </table>
                </div>
            )}

            {(pagination && totalResultCount) ? (
                <div className="flex items-center justify-between space-x-2 pt-2">
                    <div className="flex items-center gap-3">
                        <p>Showing 1 to {tableDataCount} of {totalResultCount} entries</p>

                        {!filterConfig?.disablePageSelector && (
                            <div className="flex items-center gap-2">
                                <p className="border-l ps-3 border-gray-300">Page Size</p>
                                <select value={pageSize} onChange={onPageSizeChange} className="border bg-white rounded-md text-sm px-1 py-[3px]">
                                    {((filterConfig as any).paginationOptions as Array<number>).map((i: number) => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-start gap-3">
                        <Button
                            onClick={() => fetchPrevious(currentPage)}
                            disabled={currentPage == 1}
                            size={"sm"}
                            variant={"outline"}>
                            Previous
                        </Button>
                        <Button
                            onClick={() => fetchNext(currentPage)}
                            disabled={currentPage == maxPageCount}
                            size={"sm"}
                            variant={"outline"}>
                            Next
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
})

interface HeaderProps {
    table: any,
    heading?: string
    globalFilterState: any,
    showColumnFilters?: boolean,
    searchable?: boolean
    filterConfig?: TableFilterType
    onFilterClear?: any
    setFilters?: any
    onExport?: any,
    disableExport?: boolean
    isEmpty: boolean
    isLoading?: boolean
}

const Header = ({ table, isLoading, disableExport, isEmpty, onExport, setFilters, onFilterClear, filterConfig, heading, globalFilterState, showColumnFilters, searchable }: HeaderProps) => {
    const isSmallDevice: boolean = useMediaQuery("only screen and (max-width : 1200px)");
    const [globalFilter, setGlobalFilter] = globalFilterState;
    const [show, setShow] = React.useState<boolean>(false);
    const { filters, minFilterCount = 4 } = filterConfig || {};

    let _filers = filters || [];
    const maxFilterCondition = (_filers.length > minFilterCount || isSmallDevice);

    return (
        <div className={clsx("flex items-start gap-3", (searchable || _filers.length > 0 || showColumnFilters) ? "pb-3" : "")}>
            {heading && <h1 className="text-[17px] flex-auto">{heading}</h1>}

            {(searchable || maxFilterCondition) && (
                <Input
                    placeholder="Search"
                    value={globalFilter ?? ''}
                    onChange={event => setGlobalFilter(String(event.target.value))}
                    className="w-[175px] h-[36px]"
                />
            )}

            {(filterConfig && filters && !maxFilterCondition) && (
                <div className="flex items-start w-fit flex-wrap gap-3">
                    {_filers.map((filter: any, index: number) => {
                        return <div key={index} className="w-[175px]">{filter.element}</div>
                    })}
                    {/* Manual filter trigger */}
                    {(filterConfig?.automaticFilterTriggers == false && setFilters && filterConfig?.filterFormik.dirty) ? (
                        <Button className="h-[36px]" onClick={setFilters} variant="outline">Filter</Button>
                    ) : null}
                    <Button className="h-[36px]" disabled={!filterConfig?.filterFormik.dirty} onClick={onFilterClear} variant="outline">Clear</Button>
                </div>
            )}

            <div className="flex gap-3 ml-auto">
                {(filterConfig && filters && maxFilterCondition) && (
                    <Popover open={show} onOpenChange={setShow}>
                        <PopoverTrigger asChild className="ml-auto">
                            <div className={clsx('border rounded-md flex items-center gap-2 h-[36px] px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ', filterConfig?.filterFormik.dirty && 'bg-gray-100 dark:bg-gray-800 border-gray-300')} >
                                <p className="text-sm">Filters</p>
                                <FilterIcon className="h-4 w-4" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent side='bottom' className="w-80 p-3 anim-opacity">
                            <PopoverHeader>
                                <PopoverTitle>Filters</PopoverTitle>
                                <PopoverDescription>
                                    {filterConfig?.automaticFilterTriggers == false ? (
                                        <p className="text-sm">Please click on the filter button to apply the filters.</p>
                                    ) : (
                                        <p className="text-sm">Use filters to narrow down your results.</p>
                                    )}
                                </PopoverDescription>
                            </PopoverHeader>

                            <div className="flex flex-col gap-3">
                                {filters && _filers.map((filter: any, index: number) => {
                                    return (
                                        <div key={index} className="flex items-center justify-between">
                                            <p className="text-sm">{filter.label}</p>
                                            <div key={index} className="w-[175px]">{filter.element}</div>
                                        </div>
                                    )
                                })}

                                {filterConfig?.automaticFilterTriggers != false && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">Clear</p>
                                        <div className="w-[175px]">
                                            <Button disabled={!filterConfig?.filterFormik.dirty} onClick={onFilterClear} variant="destructive">Clear</Button>
                                        </div>
                                    </div>
                                )}

                                {filterConfig?.automaticFilterTriggers == false && (
                                    <div className="flex items-center justify-between">
                                        <Button disabled={!filterConfig?.filterFormik.dirty} onClick={onFilterClear} variant="destructive">Clear</Button>
                                        <Button disabled={!filterConfig?.filterFormik.dirty} onClick={setFilters} variant="default">Filter</Button>
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {(!disableExport && !isEmpty && !isLoading) && (
                    <Button onClick={onExport} variant="outline" className="shadow-none">
                        <Download className="text-gray-700 h-5 stroke-[1px]" />
                    </Button>
                )}

                {showColumnFilters && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={clsx("shadow-none h-[36px] text-gray-700", !maxFilterCondition && 'ml-auto')}>
                                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column: any) => column.getCanHide())
                                .map((column: any) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }>
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}

CustomTable.displayName = "CustomTable";
(CustomTable as any).version = "1.0.7";
