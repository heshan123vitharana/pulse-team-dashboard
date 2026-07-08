import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import React, { useEffect, type JSX } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@radix-ui/react-label";
import { clsx } from "clsx";
import { useFrappeGetCall, type SWRConfiguration } from "frappe-react-hooks";
import _, { isEmpty, isEqual, isNumber } from "lodash";
import { Loader2, Plus } from "lucide-react";
import { useFormFieldValidation } from "../../hooks/useFormFieldValidation";
import { FormHelperText } from "./components/FormHelperText";
import { FormRequiredIndicator } from "./components/FormRequiredIndicator";
import { type DropdownOption } from "./types/forms.types";

const EMPTY_VALUE = { label: "", value: "" };

export interface FormDropDownProps {
    name: string;
    options?: DropdownOption[];
    formik: any;
    label?: string;
    placeholder?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    customMessage?: any;
    helperText?: string;
    method?: string;
    methodBody?: Record<string, any>
    swrKey?: string;
    swrConfig?: SWRConfiguration
    onNewItemSelected?: () => void
    newItemText?: string,
    itemRenderer?: (item: any) => JSX.Element
}

const FormDropDown: React.FC<FormDropDownProps> = ({
    name,
    options = [],
    formik,
    label,
    placeholder,
    isRequired,
    isDisabled,
    helperText,
    customMessage,
    method,
    methodBody,
    swrKey,
    onNewItemSelected,
    newItemText = "Add new",
    itemRenderer = null,
    swrConfig = {}
}) => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState<DropdownOption>({ label: "", value: "" })
    const [optionValues, setOptionValues] = React.useState<DropdownOption[]>(options)

    const { errorMessage, invalidStyles } = useFormFieldValidation({ formik, name, customMessage })

    const { data, isLoading, isValidating } = useFrappeGetCall(
        method ?? "", methodBody || {},
        method ? (swrKey ? swrKey : method) : null,
        { keepPreviousData: true, ...swrConfig }
    )

    useEffect(() => {
        if (isEmpty(options) && isEmpty(optionValues) && data?.message) {
            setOptionValues(_.get(data, "message", []))
        }
    }, [_.get(data, "message", []), options])

    useEffect(() => {
        if (!isEmpty(options)) {
            setOptionValues(options)
        } else {
            setOptionValues(_.get(data, "message", []))
        }
    }, [open])

    useEffect(() => {
        // Manage initial value
        const initialValue = _.get(formik.initialValues, name);

        if (initialValue) {
            formik.setFieldValue(name, initialValue)
            setValue(initialValue)
        }
    }, [])

    useEffect(() => {
        // Manage internal state
        if (value && !isEmpty(value) && (value?.value || isNumber(value.value))) {
            formik.setFieldValue(name, value.value);
            formik.setFieldValue(`${name}_meta`, value)
        }
    }, [value]);

    useEffect(() => {
        const option: DropdownOption | undefined = optionValues.find((option) => option?.value == formik.values[name])

        // Set value from formik
        if (option && !isEmpty(option) && (isNumber(option?.value) || option?.value) && !isEqual(option, value)) {
            setValue((prev: DropdownOption) => {
                if (isEqual(prev, option)) {
                    return prev
                }

                return option;
            })
        }

        // Form reset
        if (!formik.values[name] && !isNumber(formik.values[name])) {
            setValue(EMPTY_VALUE);
        }

    }, [formik.values[name], JSON.stringify(_.get(data, "message", [])), JSON.stringify(optionValues)])

    const onNewHandler = () => {
        try {
            if (onNewItemSelected) {
                onNewItemSelected();
            }
        } finally {
            setOpen(false)
        }
    }

    const onFilter = (val: string) => {
        if (val) {
            setOptionValues(optionValues.filter((option) => (option.label).toString().toLowerCase().includes(val.toLowerCase()) || (option.value).toString().toLowerCase().includes(val.toLowerCase())))
        } else {
            if (!isEmpty(options)) {
                setOptionValues(options)
            } else {
                setOptionValues(_.get(data, "message", []))
            }
        }
    }

    return (
        <div className="flex flex-col h-fit w-full">
            {label && (
                <Label className="flex gap-1 text-sm mb-1.5" htmlFor={name}>
                    {label} <FormRequiredIndicator isRequired={isRequired} />
                </Label>
            )}
            <Popover modal open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={name}
                        disabled={isDisabled}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={clsx("w-full justify-between shadow-none font-normal! h-[36px] px-2",
                            invalidStyles,
                            (value && JSON.stringify(value) != JSON.stringify(EMPTY_VALUE)) ? "text-black dark:text-white" : "text-muted-foreground"
                        )}>
                        <p key={JSON.stringify(value?.value)} className="text-opacity-anim truncate">{value.label
                            ? value.label
                            : (placeholder ?? "Select...")}</p>
                        {(isLoading || isValidating) ?
                            (
                                <Loader2 className="h-4 mt-0.5 w-4 animate-spin" />
                            ) :
                            (
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            )
                        }
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={clsx("w-[--radix-popover-trigger-width] p-0", invalidStyles)}>
                    <Command shouldFilter={false}>
                        <CommandInput onValueChange={onFilter} placeholder={placeholder ?? 'Search'} className="h-9" />
                        {optionValues.length === 0 && <div className="p-3 flex items-center justify-center text-xs text-gray-600">No options available</div>}
                        <ScrollArea>
                            <CommandGroup className="max-h-60 overflow-auto">
                                {optionValues.map((line: DropdownOption) => (
                                    <CommandItem
                                        className={clsx("p-0 m-0", (value.value === line.value) && 'pointer-events-none')}
                                        key={line.value}
                                        value={line.value}
                                        onSelect={(currentValue) => {
                                            setValue({ label: currentValue, value: line.value })
                                            setOpen(false)
                                        }}>

                                        {itemRenderer ? itemRenderer(line) : <p className={clsx("rounded w-full p-1 dark:text-white")}>{line.label}</p>}

                                        <CheckIcon
                                            className={clsx(
                                                "ml-auto h-4 w-4",
                                                value.value === line.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </Command>
                    {onNewItemSelected && (
                        <div onClick={onNewHandler} className={clsx("rounded w-[calc(--radix-popover-trigger-width - 10px)] cursor-pointer hover:bg-gray-100 p-1 mx-[5px] mb-[5px] border border-dashed text-center flex items-center transition-colors")}>
                            <Plus className="h-4" />
                            <p className="text-[12px] p-0">{newItemText}</p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
            <FormHelperText helperText={helperText} />
            {errorMessage}
        </div>
    )
}

FormDropDown.displayName = "FormDropDown";
(FormDropDown as any).version = "1.1.3";

export default FormDropDown
