import { BADGE_CLASSES } from "@/lib/general_utils";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type CellContext, type HeaderContext } from "@tanstack/react-table";
import clsx from "clsx";
import _, { isEmpty } from "lodash";
import { ArrowRightCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
interface HeaderType {
    context: HeaderContext<any, any>;
    text: string;
    align?: 'start' | 'center' | 'end';
}

interface CellType {
    context: CellContext<any, any>;
    accessorKey?: string
}

interface StrictCellType {
    context: CellContext<any, any>;
    accessorKey: string
    align?: 'start' | 'center' | 'end';
}

interface MoneyHandlerType extends StrictCellType {
    currency?: string;
}

interface LinkHandlerType extends CellType {
    align?: 'start' | 'center' | 'end';
    onClick?: () => void;
}

interface BadgeHandlerType extends CellType {
    colorSchema?: {
        [key: string]: keyof typeof BADGE_CLASSES;
    },
    mapper?: {
        [key: string]: string | number | boolean;
    }
}

interface OptionType {
    text: string;
    onClick?: () => void;
    isDisabled?: boolean;
}

interface ActionHandlerActionType extends OptionType {
    className?: string
}

const alignmentGenerator = (type: 'flex' | 'text' = 'text', align: string) => {
    if (type === 'flex') {
        return clsx((align == 'center') && 'justify-center', (align == 'start') && 'justify-start', (align == 'end') && 'justify-end')
    }

    return clsx((align == 'center') && 'text-center', (align == 'start') && 'text-start', (align == 'end') && 'text-end')
}

export const useCustomTable = () => {
    const sortHandler = ({ context, text, align = 'start' }: HeaderType) => {
        const { column } = context;

        return (
            <div
                className={clsx('flex items-center', (align == 'center') && 'justify-center', (align == 'start') && 'justify-start', (align == 'end') && 'justify-end')}>
                <Button
                    variant="ghost"
                    className="p-0 m-0 hover:bg-gray-50"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    {text}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )
    }

    const linkHandler = ({
        context, onClick = () => {
        }, align = 'start'
    }: LinkHandlerType) => {
        return (
            <div onClick={onClick}
                className={clsx('flex items-center gap-1 hover:text-orange-500 transition-colors cursor-pointer', align && alignmentGenerator("flex", align))}>
                <ArrowRightCircle className="h-4 min-w-4 text-orange-500" />
                {context.getValue()}
            </div>
        )
    }

    const optionHandler = ({ options = [] }: { options: OptionType[] }) => {
        const menuItemMarkup = options.map((option: OptionType, index: number) => {
            return <DropdownMenuItem key={index} disabled={option.isDisabled} className="capitalize"
                onSelect={option?.onClick ? option.onClick : () => {
                }}>{option.text}</DropdownMenuItem>
        });

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {menuItemMarkup}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    const badgeHandler = ({ context, colorSchema, mapper = {} }: BadgeHandlerType) => {
        const value = isEmpty(mapper) ? context.getValue() : _.get(mapper, context.getValue())
        const badgeColor: any = _.get(colorSchema, context.getValue());
        return <Badge className={`${BADGE_CLASSES[badgeColor]} my-0 py-0`}>{value}</Badge>
    }

    const moneyHandler = ({ context, accessorKey, align = 'start', currency = "LKR" }: MoneyHandlerType) => {
        const value: string = String(context.row.getValue(accessorKey)) ?? "0"
        const cleanedValue = value.replace(/,/g, '')
        const amount = parseFloat(cleanedValue)

        const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount)

        return <div className={clsx("font-medium", align && alignmentGenerator("text", align))}>{formatted}</div>
    }

    const cellHandler = ({ context, accessorKey, align = 'start' }: StrictCellType) => {
        return <div
            className={clsx(align && alignmentGenerator("text", align))}>{context.row.getValue(accessorKey)}</div>
    }

    const actionHandler = (actions: ActionHandlerActionType[]) => {
        return (
            <div className="flex item-center gap-2">
                {actions.map((action, index) => <div key={index}
                    className={clsx('text-xs text-orange-500 hover:text-orange-700 transition-all cursor-pointer border rounded-md px-1 py-0.5 border-orange-500 hover:bg-orange-100', action?.className && action.className)}
                    onClick={action.onClick}>{action.text}</div>)}
            </div>
        )
    }

    const headerHandler = (value: string | number, align: "start" | "center" | "end" = "start") => {
        return <div className={clsx("flex items-center", align && alignmentGenerator("flex", align))}>{value}</div>
    }

    const numberHandler = ({ context, accessorKey, align = 'start' }: StrictCellType) => {
        const precision = 2
        const nf = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
            minimumSignificantDigits: 1,
            maximumSignificantDigits: 20
        });
        const num = nf.format(context.row.getValue(accessorKey));

        return (
            <div className={clsx(align && alignmentGenerator("text", align))}>
                {num}
            </div>
        )
    }

    return {
        sortHandler,
        linkHandler,
        optionHandler,
        badgeHandler,
        moneyHandler,
        cellHandler,
        actionHandler,
        headerHandler,
        numberHandler
    }
}

useCustomTable.displayName = "useCustomTable";
(useCustomTable as any).version = "1.0.1";