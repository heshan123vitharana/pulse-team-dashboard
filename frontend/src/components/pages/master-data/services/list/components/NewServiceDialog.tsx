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

type NewServiceDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewServiceDialog: React.FC<NewServiceDialogProps> = ({ disclosure }) => {
    const { call: createService, loading } = useFrappePostCall(MASTER_DATA.SERVICE.CREATE);

    const formik = useFormik({
        initialValues: {
            service_name: "",
        },
        validationSchema: Yup.object({
            service_name: Yup.string()
                .trim()
                .required("Service Name is required"),
        }),
        onSubmit(values, helpers) {
            const serviceName = values.service_name.trim();
            const payload = {
                title: serviceName,
            };

            toast.promise(createService(payload), {
                loading: "Creating Service...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.SERVICE.LIST]);
                    return "Service created successfully";
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
                    <DialogTitle>New Service Classification</DialogTitle>
                    <DialogDescription>
                        Add a new Service Classification (e.g. Class I, Class II). Name must be unique.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Service Name"
                        name="service_name"
                        placeholder="e.g. Class I"
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
