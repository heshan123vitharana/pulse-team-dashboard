import {
    Alert,
    AlertTitle,
    AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
} from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

interface MessageBoxProps {
    children: ReactNode;
    type?: "info" | "message" | "warning" | "success" | "error";
    className?: string;
    title?: string;
    actions?: ReactNode; // 🔥 new
}

const MessageBox = ({
    children,
    type = "info",
    title,
    className,
    actions,
}: MessageBoxProps) => {
    const config = {
        info: {
            icon: Info,
            className: "bg-blue-100 text-blue-800 border-blue-400",
            defaultTitle: "Info",
        },
        message: {
            icon: Info,
            className: "bg-gray-100 text-gray-800 border-gray-400",
            defaultTitle: "Message",
        },
        warning: {
            icon: AlertTriangle,
            className: "bg-yellow-100 text-yellow-800 border-yellow-400",
            defaultTitle: "Warning",
        },
        success: {
            icon: CheckCircle,
            className: "bg-green-100 text-green-800 border-green-400",
            defaultTitle: "Success",
        },
        error: {
            icon: XCircle,
            className: "bg-red-100 text-red-800 border-red-400",
            defaultTitle: "Error",
        },
    };

    const { icon: Icon, className: typeClass, defaultTitle } = config[type];

    return (
        <Alert
            className={clsx(
                "mb-3 text-sm flex flex-col gap-3",
                typeClass,
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <AlertTitle className="font-semibold">
                    {title || defaultTitle}
                </AlertTitle>
            </div>

            {/* Content */}
            <AlertDescription>
                <ul className="list-disc list-inside pl-1">
                    {children}
                </ul>
            </AlertDescription>

            {/* Actions */}
            {actions && (
                <div className="flex gap-2 mt-1">
                    {actions}
                </div>
            )}
        </Alert>
    );
};

MessageBox.displayName = "MessageBox";
(MessageBox as any).version = "1.1.0";

export default MessageBox;