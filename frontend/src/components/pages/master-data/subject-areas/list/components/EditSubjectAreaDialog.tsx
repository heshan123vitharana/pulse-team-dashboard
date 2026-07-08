import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeUpdateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { type SubjectAreaRecord } from "../SubjectAreaListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditSubjectAreaDialogProps = {
    disclosure: UseDisclosureStateProps;
};

export const EditSubjectAreaDialog: React.FC<EditSubjectAreaDialogProps> = ({ disclosure }) => {
    const record = disclosure.state as SubjectAreaRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        initialValues: {
            area_name: "",
        },
        validationSchema: Yup.object({
            area_name: Yup.string()
                .trim()
                .required("Subject Area Name is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            toast.promise(updateDoc("Subject Area", record.name, { area_name: values.area_name.trim() }), {
                loading: "Updating Subject Area...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    keyInvalidator([MASTER_DATA.SUBJECT_AREA.LIST]);
                    return "Subject Area updated successfully";
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
                area_name: record.area_name || "",
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
                    <DialogTitle>Edit Subject Area</DialogTitle>
                    <DialogDescription>
                        Update the details of the selected subject area.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Subject Area Name"
                        name="area_name"
                        placeholder="e.g. Financial Analysis"
                        formik={formik}
                        isRequired
                    />
                </div>

                <DialogFooter>
                    <Button variant="secondary" type="button" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={formik.submitForm as any} disabled={loading} className="flex gap-2">
                        {loading && <LoaderIcon className="animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
