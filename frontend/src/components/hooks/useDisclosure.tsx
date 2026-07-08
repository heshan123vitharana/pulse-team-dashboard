import { type Dispatch, type SetStateAction, useState } from "react";

export interface UseDisclosureProps {
    isOpen: boolean;

    setIsOpen: Dispatch<SetStateAction<boolean>>;

    onClose(): void;

    onOpen(): void;
}

const useDisclosure = (defaultIsOpen?: boolean): UseDisclosureProps => {
    const [isOpen, setIsOpen] = useState(defaultIsOpen ?? false);

    const onOpen = () => setIsOpen(true)
    const onClose = () => setIsOpen(false)

    return { isOpen, setIsOpen, onOpen, onClose }
}

useDisclosure.displayName = "useDisclosure";
(useDisclosure as any).version = "1.0.0";

export default useDisclosure;