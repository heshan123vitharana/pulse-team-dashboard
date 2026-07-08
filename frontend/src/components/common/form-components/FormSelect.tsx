import { get, isArray, isEmpty, isEqual, isNumber } from 'lodash';
import { Loader2, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, } from "@/components/ui/command";
import { Label } from "@radix-ui/react-label";
import { clsx } from 'clsx';
import { Command as CommandPrimitive } from "cmdk";
import { type FormikValues } from "formik";
import { useFrappeGetCall } from "frappe-react-hooks";
import { useFormFieldValidation } from '../../hooks/useFormFieldValidation';
import { FormHelperText } from './components/FormHelperText';
import { FormRequiredIndicator } from './components/FormRequiredIndicator';
import { type DropdownOption } from './types/forms.types';

interface FormSelectProps {
    label?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    options?: DropdownOption[];
    formik: FormikValues;
    name: string;
    isMulti?: boolean;
    placeholder?: string;
    customMessage?: any;
    helperText?: string;
    method?: string;
    methodBody?: Record<string, any>,
    itemRenderer?: (item: any) => React.JSX.Element
}

function FormSelect({
    options = [],
    formik,
    isDisabled,
    name,
    isMulti = false,
    label,
    isRequired,
    placeholder,
    helperText,
    customMessage,
    method,
    methodBody,
    itemRenderer = null as any
}: FormSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<DropdownOption[]>([]);
    const [inputValue, setInputValue] = React.useState("");

    const { errorMessage, invalidStyles } = useFormFieldValidation({ formik, name, customMessage })

    const { data, isLoading, isValidating } = useFrappeGetCall(method ?? "", methodBody || {}, method ?? null)

    if (options.length === 0) {
        options = get(data, "message", [])
    }

    const handleUnselect = React.useCallback((framework: DropdownOption) => {
        setSelected(prev => prev.filter(s => s.value !== framework.value));
    }, []);

    // Handle onChange event
    React.useEffect(() => {
        formik.setFieldValue(name, selected.map(s => s.value));
    }, [JSON.stringify(selected)]);

    // Handle initial values
    React.useEffect(() => {
        const initialValue = get(formik.initialValues, name);

        if (isArray(initialValue) && !isEmpty(initialValue) && formik) {
            const selectedOptions: DropdownOption[] = options.filter(option => initialValue.includes(option.value));
            setSelected(selectedOptions);
        } else {
            const selectedOptions: DropdownOption[] = options.filter(option => option.value === initialValue);
            setSelected(selectedOptions);
        }
    }, []);

    React.useEffect(() => {
        const option: DropdownOption[] | undefined = options.filter((option) => option?.value == formik.values[name])

        // Set value from formik
        if (option && !isEmpty(option) && !isEqual(option, selected)) {
            setSelected(option)
            setInputValue('')
        }

        // Form reset
        if (!formik.values[name] && !isNumber(formik.values[name])) {
            setSelected([]);
            setInputValue("");
        }

    }, [formik.values[name], JSON.stringify(get(data, "message", []))])


    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    setSelected(prev => {
                        const newSelected: DropdownOption[] = [...prev];
                        newSelected.pop();
                        return newSelected;
                    })
                }
            }
            if (e.key === "Escape") {
                input.blur();
            }
        }
    }, []);

    const selectables: DropdownOption[] = options.filter(option => !selected.includes(option));

    return (
        <div className='flex flex-col h-fit'>
            <Label className="flex gap-1 text-sm" htmlFor={name}>{label} <FormRequiredIndicator
                isRequired={isRequired} /></Label>
            <Command onKeyDown={handleKeyDown}
                className={clsx('overflow-visible bg-transparent', isDisabled && 'pointer-events-none opacity-60 cursor-not-allowed')}>
                <div
                    className={clsx("group border border-input px-2 py-[7.4px] text-sm ring-offset-background rounded-md focus-within:ring-[1.5px] focus-within:ring-ring", invalidStyles)}>
                    <div className="flex gap-1 flex-wrap">
                        {selected.map((item: DropdownOption) => {
                            return (
                                <Badge key={item.value} variant="default">
                                    <p>{item.label}</p>
                                    <button
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleUnselect(item);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => handleUnselect(item)}
                                    >
                                        <X className="h-3 w-3 text-white hover:text-red-500" />
                                    </button>
                                </Badge>
                            )
                        })}

                        <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setOpen(false)}
                            onFocus={() => setOpen(true)}
                            placeholder={!isEmpty(selectables) ? placeholder ?? 'Select...' : ''}
                            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
                        />

                        {(isLoading || isValidating) && <Loader2 className="h-4 mt-0.5 w-4 animate-spin" />}
                    </div>
                </div>
                <div className="relative">
                    {open && selectables.length > 0 ?
                        <div
                            className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                            <CommandGroup className="max-h-60 overflow-auto">
                                {selectables.map((framework) => {
                                    return (
                                        <CommandItem
                                            key={framework.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={(_value) => {
                                                setInputValue("")

                                                if (isMulti) {
                                                    setSelected(prev => [...prev, framework])
                                                } else {
                                                    setSelected([framework]);
                                                    setOpen(false);
                                                    inputRef.current?.blur();
                                                }
                                            }}
                                            className={"cursor-pointer"}
                                        >
                                            {itemRenderer ? itemRenderer(framework) : <p className={clsx("rounded w-full p-1")}>{framework.label}</p>}

                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </div>
                        : null}
                </div>
            </Command>
            <FormHelperText helperText={helperText} />
            {errorMessage}
        </div>
    )
}

FormSelect.displayName = "FormSelect";
(FormSelect as any).version = "1.0.1";

export default FormSelect