import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeUpdateDoc, keyInvalidator } from "frappe-react-hooks";
import { masterDataKeyInvalidator } from "@/components/hooks/useMasterDataCalls";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { type ResourcePersonTypeRecord } from "../ResourcePersonTypeListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditResourcePersonTypeDialogProps = {
    disclosure: UseDisclosureStateProps;
};

export const EditResourcePersonTypeDialog: React.FC<EditResourcePersonTypeDialogProps> = ({ disclosure }) => {
    const record = disclosure.state as ResourcePersonTypeRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        initialValues: {
            type_name: "",
        },
        validationSchema: Yup.object({
            type_name: Yup.string()
                .trim()
                .required("Resource Person Type Name is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updatePromise = async () => {
                const newTitle = values.type_name.trim();

                await updateType({
                    title: newTitle,
                });
            };

            toast.promise(updatePromise(), {
                loading: "Updating Resource Person Type...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.RESOURCE_PERSON_TYPE.LIST]);
                    return "Resource Person Type updated successfully";
                },
                error(err) {
                    return frappeErrorHandler(err);
                },
            });
        },
    });

    React.useEffect(() => {
        if (record) {
            formik.setValues({
                type_name: record.resource_person_type_name || record.title || record.name || "",
            });
        }
    }, [record]);

    const handleCancel = () => {
        formik.resetForm();
        disclosure.onClose();
    };

    return (
        <Dialog open={disclosure.isOpen} onOpenChange={(next) => !next ? handleCancel() : disclosure.setIsOpen(next)}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>Edit Resource Person Type</DialogTitle>
                    <DialogDescription>
                        Update the details of the selected resource person type.
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
