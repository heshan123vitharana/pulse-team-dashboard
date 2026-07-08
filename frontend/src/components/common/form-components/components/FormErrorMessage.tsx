import type { FormikValues } from "formik"

interface FormErrorMessageProps {
    formik: FormikValues,
    customMessage?: string,
    name: string
}

export const FormErrorMessage = ({ formik, name, customMessage }: FormErrorMessageProps) => {
    return (
        <>
            {(formik.submitCount && formik.errors[name]) ?
                <p className="text-red-700 text-sm">{formik.errors[name]}</p> : customMessage && customMessage}
        </>
    )
}