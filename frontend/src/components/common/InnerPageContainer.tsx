import React from "react";
import { cn } from "@/lib/utils";

interface InnerPageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InnerPageContainer: React.FC<InnerPageContainerProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn("flex flex-col gap-4", className)} {...props}>
            {children}
        </div>
    );
};

export default InnerPageContainer;
