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

type NewResourcePersonTypeDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewResourcePersonTypeDialog: React.FC<NewResourcePersonTypeDialogProps> = ({ disclosure }) => {
    const { call: createType, loading } = useFrappePostCall(MASTER_DATA.RESOURCE_PERSON_TYPE.CREATE);

    const formik = useFormik({
        initialValues: {
            type_name: "",
        },
        validationSchema: Yup.object({
            type_name: Yup.string()
                .trim()
                .required("Resource Person Type Name is required"),
        }),
        onSubmit(values, helpers) {
            const typeName = values.type_name.trim();
            const payload = {
                title: typeName,
            };

            toast.promise(createType(payload), {
                loading: "Creating Resource Person Type...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.RESOURCE_PERSON_TYPE.LIST]);
                    return "Resource Person Type created successfully";
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
                    <DialogTitle>New Resource Person Type</DialogTitle>
                    <DialogDescription>
                        Add a new resource person type. Name must be unique.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Resource Person Type Name"
                        name="type_name"
                        placeholder="e.g. Internal, External, Visiting Lecturer"
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
