import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMasterDataPost as useFrappePostCall, masterDataKeyInvalidator as keyInvalidator } from "@/components/hooks/useMasterDataCalls";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureProps } from "@/components/hooks/useDisclosure";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type NewModuleBasketTypeDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewModuleBasketTypeDialog: React.FC<NewModuleBasketTypeDialogProps> = ({ disclosure }) => {
    const { call: createBasketType, loading } = useFrappePostCall(MASTER_DATA.MODULE_BASKET_TYPE.CREATE);

    const formik = useFormik({
        initialValues: {
            basket_type_name: "",
        },
        validationSchema: Yup.object({
            basket_type_name: Yup.string()
                .trim()
                .required("Module Basket Type Name is required"),
        }),
        onSubmit(values, helpers) {
            const basketName = values.basket_type_name.trim();
            const payload = {
                title: basketName,
            };

            toast.promise(createBasketType(payload), {
                loading: "Creating Module Basket Type...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.MODULE_BASKET_TYPE.LIST]);
                    return "Module Basket Type created successfully";
                },
                error(err) {
                    return frappeErrorHandler(err);
                },
            });
        },
    });

    const handleCancel = () => {
        formik.resetForm();
        disclosure.onClose();
    };

    return (
        <Dialog open={disclosure.isOpen} onOpenChange={disclosure.setIsOpen}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>New Module Basket Type</DialogTitle>
                    <DialogDescription>
                        Create a new module basket type. Name must be unique.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Module Basket Type Name"
                        name="basket_type_name"
                        placeholder="e.g. Core, Elective, Optional"
                        formik={formik}
                        isRequired
                    />
                </div>

                <DialogFooter>
                    <Button variant="secondary" type="button" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={formik.submitForm as any} disabled={loading} className="flex gap-2">
                        {loading && <LoaderIcon className="h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
