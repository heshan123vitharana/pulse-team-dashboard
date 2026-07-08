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
import { type ModuleGroupRecord } from "../ModuleGroupListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditModuleGroupDialogProps = {
    disclosure: UseDisclosureStateProps;
};

export const EditModuleGroupDialog: React.FC<EditModuleGroupDialogProps> = ({ disclosure }) => {
    const record = disclosure.state as ModuleGroupRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        initialValues: {
            group_name: "",
        },
        validationSchema: Yup.object({
            group_name: Yup.string()
                .trim()
                .required("Module Group Name is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updatePromise = async () => {
                const newTitle = values.group_name.trim();

                await updateGroup({
                    title: newTitle,
                });
            };

            toast.promise(updatePromise(), {
                loading: "Updating Module Group...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.MODULE_GROUP.LIST]);
                    return "Module Group updated successfully";
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
                group_name: record.group_name || record.title || record.name || "",
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
                    <DialogTitle>Edit Module Group</DialogTitle>
                    <DialogDescription>
                        Update the details of the selected module group.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Module Group Name"
                        name="group_name"
                        placeholder="e.g. Core Modules, Electives"
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
