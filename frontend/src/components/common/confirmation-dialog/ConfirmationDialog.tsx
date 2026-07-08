
import { useDispatch, useSelector } from "react-redux"
import AlertDialogModal from "../alert-dialog/AlertDialogModal"
import { get } from "lodash"
import { setVisibility } from "@/store/reducers/confirm-dialog"
import type { ReactElement } from "react"

const ConfirmationDialog = () => {
    const dispatch = useDispatch()
    const { visible, model } = useSelector((state: any) => state.confirmDialog)

    const confirmHandler = () => {
        model?.onConfirm()
    }

    const setOpen = (state: any) => {
        dispatch(setVisibility(state))
    }

    return (
        <AlertDialogModal
            alertActionTrigger={false}
            action={confirmHandler}
            isOpen={visible}
            setOpen={setOpen}
            primaryButtonColorSchema="bg-red-500"
            description={get(model, 'description', '')}
            label="Alert Dialog Box"
            title={get(model, 'title', '')}
            size={get(model, 'size', 'sm')}
            icon={get(model, 'icon', null)}
        />
    )
}

ConfirmationDialog.displayName = "ConfirmationDialog";
(ConfirmationDialog as any).version = "1.0.0";

export default ConfirmationDialog