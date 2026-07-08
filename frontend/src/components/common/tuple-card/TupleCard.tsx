import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";
import { get } from "lodash";
import React, { Fragment, type JSX, type ReactElement, cloneElement, isValidElement } from "react";

interface ITupleCard {
    children?: ReactElement[] | ReactElement | JSX.Element,
    title?: string
    description?: string
    isLoading?: boolean,
    className?: string,
    hideSeparators?: boolean
    lineGap?: number
}

const isATupleCardLine = (child: any) => {
    return (typeof child.type === "function" && (get(child, 'type.displayName') == 'TupleCardLine'))
}

function TupleCard({ children, title, isLoading, description, className, hideSeparators = false, lineGap = 10 }: ITupleCard) {

    const addSeparators = (children: ReactElement[] | ReactElement) => {
        return React.Children.toArray(children).reduce((acc: ReactElement[], child: any, index, array) => {
            const element = isValidElement(child)
                ? cloneElement(child, (isATupleCardLine(child) ? { isLoading } : {}) as any)
                : child;

            acc.push(element);

            if (
                index < array.length - 1 && // Not the last element
                !hideSeparators && // Not explicitly hidden
                !((array[index + 1] as any)?.type == Fragment) // Not a Fragment
            ) {
                acc.push(<Separator key={`separator-${index}`} />);
            }

            return acc;
        }, []);
    };

    return (
        <Card size="sm" className={clsx("mb-3", className && className)} style={{ gap: `${lineGap}px` }}>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>
                        {description}
                    </CardDescription>}
                </CardHeader>
            )}
            <CardContent className="flex flex-col gap-2">
                {addSeparators(children as any)}
            </CardContent>
        </Card>
    )
}

TupleCard.displayName = "TupleCard";
(TupleCard as any).version = "1.0.5";

export default TupleCard