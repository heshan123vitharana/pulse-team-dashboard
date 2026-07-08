import { type Dispatch, type SetStateAction, useState } from "react";

export interface UseDisclosureStateProps {
    isOpen: boolean;

    setIsOpen: Dispatch<SetStateAction<boolean>>;

    onClose(): void;

    onOpen(data?: any): void;

    state: any
}

const useDisclosureState = (defaultIsOpen?: boolean): UseDisclosureStateProps => {
    const [isOpen, setIsOpen] = useState(defaultIsOpen ?? false);
    const [state, setState] = useState<any>(null)

    const onOpen = (data: any = null) => {
        setState(data)
        setIsOpen(true)
    }

    const onClose = () => {
        setState(null)
        setIsOpen(false)
    }

    return { isOpen, setIsOpen, onOpen, onClose, state }
}

useDisclosureState.displayName = "useDisclosureState";
(useDisclosureState as any).version = "1.0.0";

export default useDisclosureState;