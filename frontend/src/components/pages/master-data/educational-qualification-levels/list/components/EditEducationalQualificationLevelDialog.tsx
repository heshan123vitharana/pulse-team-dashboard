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
import { type EducationalQualificationLevelRecord } from "../EducationalQualificationLevelListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditEducationalQualificationLevelDialogProps = {
    disclosure: UseDisclosureStateProps;
};

export const EditEducationalQualificationLevelDialog: React.FC<EditEducationalQualificationLevelDialogProps> = ({ disclosure }) => {
    const record = disclosure.state as EducationalQualificationLevelRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        initialValues: {
            level_name: "",
        },
        validationSchema: Yup.object({
            level_name: Yup.string()
                .trim()
                .required("Level Name is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updatePromise = async () => {
                const newTitle = values.level_name.trim();
                await updateDoc("Educational Qualification Level", record.name, {
                    title: newTitle,
                    level_name: newTitle,
                });
            };

            toast.promise(updatePromise(), {
                loading: "Updating Qualification Level...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    masterDataKeyInvalidator([TAGS.EDUCATIONAL_QUALIFICATION_LEVEL.LIST]);
                    return "Qualification Level updated successfully";
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
                level_name: record.level_name || record.title || record.name || "",
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
                    <DialogTitle>Edit Qualification Level</DialogTitle>
                    <DialogDescription>
                        Update the details of the selected qualification level.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Qualification Level Name"
                        name="level_name"
                        placeholder="e.g. PhD, Bachelor's"
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
