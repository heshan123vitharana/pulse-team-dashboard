import { HomeIcon, RefreshCcwIcon, SearchAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <Empty className="h-dvh bg-muted/30 flex items-center justify-center">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <SearchAlert />
                </EmptyMedia>
                <EmptyTitle>404 Not Found</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                    The page you are looking for does not exist.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="outline" onClick={() => navigate("/app")}>
                    <HomeIcon />
                    Go to Home
                </Button>
            </EmptyContent>
        </Empty>
    )
}
