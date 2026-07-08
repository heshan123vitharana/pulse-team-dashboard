import { type FormikConfig, type FormikValues, useFormik } from "formik";

export interface FormikX {
    formik: FormikValues, config: FormikConfig<any>
}

export const useFormikX = (config: FormikConfig<any>): FormikX => {
    const formik = useFormik({ ...config })

    return { formik, config }
}

useFormikX.displayName = "useFormikX";
(useFormikX as any).version = "1.0.0";