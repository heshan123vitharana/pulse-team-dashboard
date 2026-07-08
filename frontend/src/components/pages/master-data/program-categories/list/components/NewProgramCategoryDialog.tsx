import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeCreateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureProps } from "@/components/hooks/useDisclosure";
import { MASTER_DATA } from "@/components/common/consts/tags.consts";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type NewProgramCategoryDialogProps = {
    disclosure: UseDisclosureProps;
    onSuccess?: () => void;
};

export const NewProgramCategoryDialog: React.FC<NewProgramCategoryDialogProps> = ({ disclosure, onSuccess }) => {
    const { createDoc, loading } = useFrappeCreateDoc();

    const formik = useFormik({
        initialValues: {
            title: "",
        },
        validationSchema: Yup.object({
            title: Yup.string()
                .trim()
                .required("Program Category Name is required"),
        }),
        onSubmit(values, helpers) {
            const payload = {
                title: values.title.trim(),
                is_active: 1,
            };

            toast.promise(createDoc("Program Category", payload), {
                loading: "Creating Program Category...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.PROGRAM_CATEGORY.LIST]);
                    if (onSuccess) setTimeout(() => onSuccess(), 500);
                    return "Program Category created successfully";
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
        <Dialog open={disclosure.isOpen} onOpenChange={(open) => !open ? handleCancel() : disclosure.setIsOpen(true)}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>New Program Category</DialogTitle>
                    <DialogDescription>
                        Add a new program category to the system. Name must be unique.
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
