import type { FormikValues } from "formik";
import { FormErrorMessage } from "../components/FormErrorMessage";

interface UseFormValidationProps {
    formik: FormikValues,
    name: string,
    customMessage?: string
}

export const useFormFieldValidation = ({ formik, name, customMessage }: UseFormValidationProps) => {
    const borderStyles = 'border border-red-600 focus-visible:ring-red-600 focus-visible:ring-1';
    const invalidStyles = (Boolean(formik.submitCount && formik.errors[name])) && borderStyles;
    const errorMessage = <FormErrorMessage formik={formik} name={name} customMessage={customMessage} />

    return {
        invalidStyles,
        errorMessage
    }
}
