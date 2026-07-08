import { Input } from "@/components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import { clsx } from "clsx";
import React from "react";
import { useFormFieldValidation } from "../../hooks/useFormFieldValidation";
import { FormHelperText } from "./components/FormHelperText";
import { FormRequiredIndicator } from "./components/FormRequiredIndicator";
import _ from "lodash";
import { shadcnDateParser } from "@/lib/general_utils";

interface FormInputProps extends React.ComponentProps<"input"> {
    label?: string;
    placeholder?: string;
    name: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    customMessage?: any;
    helperText?: string;
    formik: any;
    type?: React.HTMLInputTypeAttribute,
    onChange?: (value: any) => any
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({
    formik,
    label,
    placeholder,
    name,
    isRequired,
    customMessage,
    helperText,
    type,
    isDisabled,
    onChange,
    ...props
}, ref) => {
    const { errorMessage, invalidStyles } = useFormFieldValidation({ formik, name, customMessage })
    const { className, ...rest } = props

    const getValue = () => {
        const value = formik.values[name];

        if (value === "0" || value === 0) {
            return 0;
        }

        if (type === "datetime-local") {
            return shadcnDateParser(value);
        }

        return value || "";
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue(name, e.target.value)

        try {
            if (onChange) {
                onChange(e.target.value);
            }
        } catch (error) {
            console.error("Form Input Error =>", error);
        }
    }

    return (
        <>
            <div className="flex flex-col h-fit">
                {label && (
                    <Label className="flex gap-1 text-sm mb-1.5" htmlFor={name}>
                        {label} <FormRequiredIndicator isRequired={isRequired} />
                    </Label>
                )}
                <Input
                    {...rest}
                    ref={ref}
                    disabled={isDisabled}
                    className={clsx("h-[36px] bg-white focus-visible:ring-offset-0", invalidStyles, className)}
                    required={isRequired} type={type} id={name}
                    name={name}
                    aria-autocomplete="none"
                    value={getValue()}
                    onChange={onInputChange}
                    placeholder={placeholder} />
                <FormHelperText helperText={helperText} />
                {errorMessage}
            </div>
        </>
    )
})

FormInput.displayName = "FormInput";
(FormInput as any).version = "1.0.4";

export default FormInput