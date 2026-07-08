interface FormRequiredIndicatorProps {
    isRequired?: boolean;
}

export const FormRequiredIndicator = ({ isRequired }: FormRequiredIndicatorProps) => {
    if (!isRequired) return null;

    return (
        <p className="text-red-700">*</p>
    )
}