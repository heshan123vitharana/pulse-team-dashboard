import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InfoCircledIcon, QuestionMarkIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { BluetoothIcon, Icon } from "lucide-react";
import React, { type ReactElement } from "react";

interface IAlertDialogProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    label: string;
    title: string;
    description?: string | ReactElement;
    primaryButtonText?: string;
    action: () => any;
    primaryButtonColorSchema?: string;
    cancelButtonColorSchema?: string;
    alertActionTrigger?: boolean;
    size?: "sm" | "default",
    icon?: ReactElement
}

const AlertDialogModal: React.FC<IAlertDialogProps> = ({
    label,
    title,
    description,
    isOpen,
    setOpen,
    primaryButtonText,
    action,
    primaryButtonColorSchema,
    cancelButtonColorSchema,
    alertActionTrigger = true,
    size = "sm",
    icon = InfoCircledIcon
}) => {

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpen}>
            {
                alertActionTrigger ? (
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">{label}</Button>
                    </AlertDialogTrigger>
                ) : null
            }

            <AlertDialogContent size={size}>
                <AlertDialogHeader>
                    {icon ? (
                        <AlertDialogMedia>
                            {icon as any}
                        </AlertDialogMedia>
                    ) : null}

                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className={clsx("h-8", cancelButtonColorSchema && cancelButtonColorSchema)}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        className={clsx("h-8", primaryButtonColorSchema && primaryButtonColorSchema)}
                        onClick={action}>
                        {primaryButtonText ? primaryButtonText : "Confirm"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

AlertDialogModal.displayName = "AlertDialogModal";
(AlertDialogModal as any).version = "1.0.1";

export default AlertDialogModal