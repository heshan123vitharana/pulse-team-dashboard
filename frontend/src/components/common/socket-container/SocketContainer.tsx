import { keyInvalidator, useFrappeEventListener } from "frappe-react-hooks";
import { get, isEmpty } from "lodash";
import { toast } from "sonner";
import bell from "./assets/bell.mp3"
import { useNavigate } from "react-router-dom";
import { MarkdownRenderer } from "../markdown-renderer/MarkdownRenderer";
import { useSounds } from "@/components/hooks/useSounds";
import { PROJECT_CONFIG } from "@/components/project-config";


export const SocketContainer = ({ children }: any) => {
    const { playSound } = useSounds(bell);
    const navigate = useNavigate()

    useFrappeEventListener("shadcn-socket-notification", (res: any) => {
        const app = get(res, "_Notification__app")
        const type = get(res, "_Notification__type")
        const duration = get(res, "_Notification__duration", 4000) || 4000
        const muted = get(res, "_Notification__is_muted")
        const isPersistent = get(res, "_Notification__is_persistent")

        if (PROJECT_CONFIG.base.app != app) return

        if (isPersistent == true) {
            keyInvalidator(["SHADCN-GET-NOTIFICATION-LIST"])
        }

        if (!type || !isEmpty(res)) {
            switch (type) {
                case "Info":
                    toast.info(<Notification {...res} />, {
                        duration: duration,
                        position: "top-right"
                    });
                    break;
                case "Error":
                    toast.error(<Notification {...res} />, {
                        duration: duration,
                        position: "top-right"
                    });
                    break;
                case "Success":
                    toast.success(<Notification {...res} />, {
                        duration: duration,
                        position: "top-right"
                    })
                    break;
                case "Warning":
                    toast.warning(<Notification {...res} />, {
                        duration: duration,
                        position: "top-right"
                    });
                    break;
                default:
                    toast(<Notification {...res} />, {
                        duration: duration,
                        position: "top-right"
                    });
            }
        }

        if (muted == false) {
            playSound()
        }
    })

    useFrappeEventListener("shadcn-socket-routing", (res: any) => {
        const app = get(res, "_Routing__app")
        const route = get(res, "_Routing__route")
        const replace = get(res, "_Routing__replace")

        if (PROJECT_CONFIG.base.app != app) return

        if (!route) return

        navigate(route, { replace })
    })

    useFrappeEventListener("shadcn-socket-invalidation", (res: any) => {
        console.log("🚀 ~ useFrappeEventListener - SSI ~ res:", res)
        const app = get(res, "_Invalidation__app")
        const keys = get(res, "_Invalidation__keys", []) || []

        if (PROJECT_CONFIG.base.app != app) return

        if (isEmpty(keys)) return

        keyInvalidator(keys)
    })

    return (
        <>
            {children}
        </>
    )
}

SocketContainer.displayName = "SocketContainer";
(SocketContainer as any).version = "1.0.0";

type INotification = {
    _Notification__title: string,
    _Notification__subtitle?: string
}

const Notification = ({ _Notification__title, _Notification__subtitle }: INotification) => {
    return (
        <div>
            <p>{_Notification__title}</p>
            {_Notification__subtitle && (
                <p style={{ opacity: 0.7 }}>
                    <MarkdownRenderer content={_Notification__subtitle} />
                </p>
            )}
        </div>
    )
}