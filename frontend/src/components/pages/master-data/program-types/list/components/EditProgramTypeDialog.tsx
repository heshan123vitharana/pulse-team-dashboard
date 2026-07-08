import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeUpdateDoc, useFrappeGetCall, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import FormDropDown from "@/components/common/form-components/FormDropDown";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { type ProgramTypeRecord } from "../ProgramTypeListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditProgramTypeDialogProps = {
    disclosure: UseDisclosureStateProps;
    onSuccess?: () => void;
};

export const EditProgramTypeDialog: React.FC<EditProgramTypeDialogProps> = ({ disclosure, onSuccess }) => {
    const record = disclosure.state as ProgramTypeRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();
    const { data: categories } = useFrappeGetCall("cams_v3.master_data.get_program_category_list_for_dd", {}, "CAT_DD");

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: record ? record.title : "",
            program_category: record ? record.program_category : "",
        },
        validationSchema: Yup.object({
            title: Yup.string().trim().required("Title is required"),
            program_category: Yup.string().required("Category is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updateProcess = async () => {
                await updateDoc("Program Type", record.name, {
                    title: values.title.trim(),
                    program_category: values.program_category,
                });
            };

            toast.promise(updateProcess(), {
                loading: "Updating...",
                success() {
                    disclosure.onClose();
                    keyInvalidator([TAGS.PROGRAM_TYPE.LIST]);
                    if (onSuccess) setTimeout(() => onSuccess(), 500);
                    return "Updated successfully";
                },
                error(err) { return frappeErrorHandler(err); }
            });
        },
    });

    return (
        <Dialog
            open={disclosure.isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    formik.resetForm();
                    disclosure.onClose();
                } else {
                    disclosure.setIsOpen(true);
                }
            }}
        >
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Program Type</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                    <FormInput label="Title" name="title" formik={formik} isRequired />
                    <FormDropDown
                        label="Category"
                        name="program_category"
                        formik={formik}
                        options={Array.isArray(categories) ? categories.map((c: any) => ({ label: c.name, value: c.name })) : []}
                        isRequired
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => disclosure.onClose()}>Cancel</Button>
                    <Button onClick={formik.submitForm as any} disabled={loading}>
                        {loading && <LoaderIcon className="animate-spin h-4 w-4" />}Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
