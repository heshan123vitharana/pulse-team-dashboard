import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@radix-ui/react-label";
import { clsx } from "clsx";
import _ from "lodash";
import React from "react";
import { useFormFieldValidation } from "../../hooks/useFormFieldValidation";
import { FormHelperText } from "./components/FormHelperText";
import { FormRequiredIndicator } from "./components/FormRequiredIndicator";

interface FormTextAreaProps extends React.ComponentProps<"textarea"> {
    label?: string;
    placeholder?: string;
    name: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    customMessage?: any;
    helperText?: string;
    formik: any;
    height?: string;
}

const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(({
    formik,
    label,
    placeholder,
    name,
    isRequired,
    customMessage,
    helperText,
    isDisabled,
    height,
    ...props
}, ref) => {
    const { errorMessage, invalidStyles } = useFormFieldValidation({ formik, name, customMessage })

    const { className, ...rest } = props
    return (
        <>
            <div className="flex flex-col h-fit">
                {label && (
                    <Label className="flex gap-1 text-sm mb-1.5" htmlFor={name}>
                        {label} <FormRequiredIndicator isRequired={isRequired} />
                    </Label>
                )}
                <Textarea ref={ref} {...rest} disabled={isDisabled}
                    className={clsx("bg-white focus-visible:ring-offset-0", invalidStyles, height ? height : "h-24", className)}
                    required={isRequired} id={name}
                    name={name} value={_.isEmpty(formik.values) ? '' : formik.values[name]}
                    onChange={formik.handleChange}
                    placeholder={placeholder} />
                <FormHelperText helperText={helperText} />
                {errorMessage}
            </div>
        </>
    )
})

FormTextArea.displayName = "FormTextArea";
(FormTextArea as any).version = "1.0.0";

export default FormTextArea