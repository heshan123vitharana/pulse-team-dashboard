import { useDispatch } from "react-redux";
import { showConfirmDialog, hideConfirmDialog } from "@/store/reducers/confirm-dialog";
import { type ReactElement } from "react";

interface ShowConfirmDialogConfig {
    title?: string;
    description?: string | ReactElement;
    onConfirm: () => void;
    size?: "sm" | "default",
    icon?: ReactElement
}

interface UseConfirmationDialogHook {
    showConfirmationDialog: (payload: ShowConfirmDialogConfig) => void;
    hideConfirmationDialog: () => void;
}

export const useConfirmationDialog = (): UseConfirmationDialogHook => {
    const dispatch = useDispatch();

    const showConfirmationDialog = (payload: ShowConfirmDialogConfig) => dispatch(showConfirmDialog(payload));

    const hideConfirmationDialog = () => dispatch(hideConfirmDialog());

    return { showConfirmationDialog, hideConfirmationDialog };
}

useConfirmationDialog.displayName = "useConfirmationDialog";
(useConfirmationDialog as any).version = "1.0.1";