import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COLOR_SCHEMAS } from "@/lib/general_utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { get } from "lodash";
import React, { useMemo } from "react";
import type { ColorSchemaType } from "../types/common.type";

interface PanelProps {
    children: React.ReactNode;
    title?: string;
    subTitle?: string;
    topPadding?: boolean;
    bottomPadding?: boolean;
    actions?: Array<PanelActionType>;
    className?: string;
    disabled?: boolean;
    newLineActions?: boolean;
}

export type PanelActionType = {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
    isDisabled?: boolean;
    buttonColorScheme?: ColorSchemaType;
    buttonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
    isLoading?: boolean;
};

const isAFormComponent = (type: string | undefined) => {
    if (!type) return false;
    return [
        "FormInput",
        "FormTextArea",
        "FormDropDown",
        "FormSelect",
        "FormCheckBox",
        "FormSearchableDropdown",
        "FormDatePicker"
    ].includes(type);
};

export const Panel = ({
    children,
    title,
    subTitle,
    topPadding,
    bottomPadding = false,
    actions,
    className,
    disabled,
    newLineActions = false
}: PanelProps) => {
    const ref = React.useRef<HTMLDivElement>(null);

    const actionMarkup = useMemo(() => {
        if (!actions) return null;

        return actions.map((action, index) => (
            <Button
                key={index}
                size="sm"
                variant={action.buttonVariant || "outline"}
                className={clsx(
                    "h-8 px-3 text-xs",
                    action.buttonColorScheme && COLOR_SCHEMAS[action.buttonColorScheme],
                    (action.isLoading || action.isDisabled) && "cursor-not-allowed opacity-70",
                    action.buttonColorScheme && action.buttonVariant !== "outline" && "border-none"
                )}
                disabled={Boolean(action.isDisabled) || action.isLoading}
                onClick={action.onClick}
            >
                {action.icon && (
                    <span className="mr-1">{action.icon}</span>
                )}
                {action.isLoading && (
                    <ReloadIcon className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {action.text}
            </Button>
        ));
    }, [actions]);

    const cloneChildrenWithProps = (children: React.ReactNode, props: any) => {
        return React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                if (
                    typeof child.type === "function" &&
                    isAFormComponent(get(child, "type.name"))
                ) {
                    return React.cloneElement(child, {
                        isDisabled: props.isDisabled || (child as any).props.isDisabled
                    } as any);
                }

                if (
                    typeof child.type !== "function" &&
                    isAFormComponent(get(child, "type.render.displayName"))
                ) {
                    return React.cloneElement(child, {
                        isDisabled: props.isDisabled || (child as any).props.isDisabled
                    } as any);
                }

                return child;
            }
            return child;
        });
    };

    return (
        <Card
            size="sm"
            className={clsx(
                "w-full transition-all",
                topPadding && "mt-4",
                disabled && "opacity-70",
                className && className
            )}
        >
            {(title || subTitle || actionMarkup) && (
                <CardHeader className={clsx("border-b", !newLineActions && "flex justify-between")}>
                    <div className="flex flex-col">
                        {title && (
                            <CardTitle>{title}</CardTitle>
                        )}
                        {subTitle && (
                            <CardDescription>
                                {subTitle}
                            </CardDescription>
                        )}
                    </div>

                    {actionMarkup && (
                        <div className="flex items-center gap-2">
                            {actionMarkup}
                        </div>
                    )}
                </CardHeader>
            )}

            <CardContent
                ref={ref}
                className={clsx(bottomPadding ? "pb-3" : "")}
            >
                {cloneChildrenWithProps(children, { isDisabled: disabled })}
            </CardContent>
        </Card>
    );
};

Panel.displayName = "Panel";
(Panel as any).version = "2.0.0";
