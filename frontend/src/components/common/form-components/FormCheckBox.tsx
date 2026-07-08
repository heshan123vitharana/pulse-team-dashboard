import { FormHelperText } from "@/components/common/form-components/components/FormHelperText";
import { FormRequiredIndicator } from "@/components/common/form-components/components/FormRequiredIndicator";
import { useFormFieldValidation } from "@/components/hooks/useFormFieldValidation";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@radix-ui/react-label";
import { clsx } from "clsx";
import _ from "lodash";
import React from "react";

interface IFormCheckBoxProps {
    label: string;
    name: string;
    formik: any,
    helperTxt?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    customMessage?: any;
    classNames?: string;
}

const FormCheckBox: React.FC<IFormCheckBoxProps> = ({
    label,
    name,
    formik,
    helperTxt,
    isDisabled,
    isRequired,
    customMessage,
    classNames
}) => {

    const { errorMessage, invalidStyles } = useFormFieldValidation({ formik, name, customMessage })

    const onCheckedChangeHandler = (value: boolean) => {
        formik.setFieldValue(name, value)
    }

    return (
        <div className={clsx('flex space-x-2', classNames && classNames)}>
            <Checkbox id={name} name={name}
                checked={_.isEmpty(formik.values) ? false : Boolean(formik.values[name])}
                onCheckedChange={onCheckedChangeHandler}
                className={clsx("", invalidStyles)}
                disabled={isDisabled} required={isRequired} />
            <div className="flex flex-col">
                <Label className="flex gap-1 text-sm" htmlFor={name}>{label} <FormRequiredIndicator
                    isRequired={isRequired} /></Label>
                <FormHelperText helperText={helperTxt} />
                {errorMessage}
            </div>
        </div>
    )
}

FormCheckBox.displayName = "FormCheckBox";
(FormCheckBox as any).version = "1.0.0";

export default FormCheckBox