interface FormHelperTextProps {
    helperText?: string;
}

export const FormHelperText = ({ helperText }: FormHelperTextProps) => {
    if (!helperText) return null;

    return (
        <p className="opacity-40 text-sm">{helperText}</p>
    )
}