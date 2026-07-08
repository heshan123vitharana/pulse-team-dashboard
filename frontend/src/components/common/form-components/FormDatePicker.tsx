import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Label } from "@radix-ui/react-label";
import { clsx } from "clsx";
import type { FormikValues } from "formik";
import _ from "lodash";
import { CalendarIcon } from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FormHelperText } from "./components/FormHelperText";
import { FormRequiredIndicator } from "./components/FormRequiredIndicator";
import { useFormFieldValidation } from "../../hooks/useFormFieldValidation";
import { format } from "date-fns";

interface IFormDatePickerProps {
    name: string;
    label?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    customMessage?: any;
    helperText?: string;
    formik: FormikValues;
    dateFormat?: string;
    placeHolder?: string;
}

const FormDatePicker: React.FC<IFormDatePickerProps> = ({ name, dateFormat, label, isRequired, isDisabled, customMessage, helperText, formik, placeHolder }) => {
    const [show, setShow] = useState(false);
    const [date, setDate] = React.useState<Date>()
    const { errorMessage, invalidStyles } = useFormFieldValidation({ formik, name, customMessage })

    useEffect(() => {
        const initialValue = _.get(formik.initialValues, name);

        if (initialValue) {
            formik.setFieldValue(name, initialValue)
            setDate(initialValue)
        }
    }, [])

    useEffect(() => {
        if (Date.parse(formik.values[name])) {
            setDate(new Date(formik.values[name]))
        } else {
            setDate(undefined)
        }
    }, [formik.values[name]])

    useEffect(() => {
        if (date) {
            formik.setFieldValue(name, moment(date).format(dateFormat ? dateFormat : 'YYYY-MM-DD'))
        }
    }, [date]);

    return (
        <div className="flex flex-col h-fit">
            <Label className="flex gap-1 text-sm" htmlFor={name}>{label} <FormRequiredIndicator isRequired={isRequired} /></Label>
            <Popover open={show} onOpenChange={setShow}>
                <PopoverTrigger disabled={isDisabled} asChild>
                    <Button
                        variant={"outline"}
                        className={clsx(
                            "w-ful h-[36px] justify-start text-left font-normal shadow-none",
                            !date && "text-muted-foreground",
                            invalidStyles
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>{placeHolder ?? "Pick a date"}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 " align="end">
                    <Calendar
                        disabled={isDisabled}
                        mode="single"
                        selected={date}
                        onSelect={(value: any) => {
                            setDate(value);
                            setShow(false);
                        }}
                        className={clsx("min-w-[300px] w-[--radix-popover-trigger-width] flex justify-center", invalidStyles)}
                    />
                </PopoverContent>
            </Popover>
            <FormHelperText helperText={helperText} />
            {errorMessage}
        </div>
    )
}

FormDatePicker.displayName = "FormDatePicker";
(FormDatePicker as any).version = "1.0.0";

export default FormDatePicker