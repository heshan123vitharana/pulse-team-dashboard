import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeUpdateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { MASTER_DATA } from "@/components/common/consts/tags.consts";
import { type ProgramCategoryRecord } from "../ProgramCategoryListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditProgramCategoryDialogProps = {
    disclosure: UseDisclosureStateProps;
    onSuccess?: () => void;
};

export const EditProgramCategoryDialog: React.FC<EditProgramCategoryDialogProps> = ({ disclosure, onSuccess }) => {
    const record = disclosure.state as ProgramCategoryRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: record ? (record.title || record.name || "") : "",
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .trim()
                .required("Program Category Name is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updateProcess = async () => {
                const newTitle = values.title.trim();
                await updateDoc("Program Category", record.name, {
                    title: newTitle,
                });
            };

            toast.promise(updateProcess(), {
                loading: "Updating Program Category...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.PROGRAM_CATEGORY.LIST]);
                    if (onSuccess) setTimeout(() => onSuccess(), 500);
                    return "Program Category updated successfully";
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
        <Dialog open={disclosure.isOpen} onOpenChange={(next) => !next ? handleCancel() : disclosure.setIsOpen(next)}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>Edit Program Category</DialogTitle>
                    <DialogDescription>
                        Update the details of the selected program category.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Program Category Name"
                        name="title"
                        placeholder="e.g. Fee Levying, Non Fee Levying"
                        formik={formik}
                        isRequired
                    />
                </div>

                <DialogFooter>
                    <Button variant="secondary" type="button" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={formik.submitForm as any} disabled={loading} className="flex gap-2">
                        {loading && <LoaderIcon className="animate-spin h-4 w-4" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
