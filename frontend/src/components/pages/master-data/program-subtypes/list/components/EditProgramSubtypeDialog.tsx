import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeUpdateDoc, useFrappePostCall, keyInvalidator } from "frappe-react-hooks";
import { masterDataKeyInvalidator } from "@/components/hooks/useMasterDataCalls";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import FormDropDown from "@/components/common/form-components/FormDropDown";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { type ProgramSubtypeRecord } from "../ProgramSubtypeListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditProgramSubtypeDialogProps = {
    disclosure: UseDisclosureStateProps;
    onSuccess?: () => void;
};

export const EditProgramSubtypeDialog: React.FC<EditProgramSubtypeDialogProps> = ({ disclosure, onSuccess }) => {
    const record = disclosure.state as ProgramSubtypeRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();
    const { call: fetchTypeList, loading: typeLoading } = useFrappePostCall(MASTER_DATA.PROGRAM_SUBTYPE.TYPE_DD);

    const [typeOptions, setTypeOptions] = React.useState<{ label: string; value: string }[]>([]);

    React.useEffect(() => {
        if (disclosure.isOpen) {
            fetchTypeList({})
                .then((res: any) => {
                    const rawTypes = Array.isArray(res) ? res : res?.message || [];
                    const options = rawTypes.map((t: any) => ({
                        label: t.title || t.type_name || t.name || t.program_type || t.label,
                        value: t.name || t.program_type || t.value,
                    }));
                    setTypeOptions(options);
                })
                .catch((err) => console.error(err));
        }
    }, [disclosure.isOpen]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: record ? ((record as any).title || (record as any).subtype_name || record.name || "") : "",
            program_type: record ? ((record as any).program_type || (record as any).parent_type || "") : "",
        },
        validationSchema: Yup.object({
            title: Yup.string().trim().required("Title is required"),
            program_type: Yup.string().required("Program Type is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updateProcess = async () => {
                const newTitle = values.title.trim();
                await updateDoc("Program Subtype", record.name, {
                    title: newTitle,
                    program_type: values.program_type,
                });
            };

            toast.promise(updateProcess(), {
                loading: "Updating Program Subtype...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    masterDataKeyInvalidator([TAGS.PROGRAM_SUBTYPE.LIST]);
                    setTimeout(() => {
                        if (onSuccess) onSuccess();
                    }, 500);
                    return "Program Subtype updated successfully";
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
        <Dialog open={disclosure.isOpen} onOpenChange={(open) => {
            if (!open) handleCancel();
            else disclosure.setIsOpen(true);
        }}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>Edit Program Subtype</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput label="Title" name="title" formik={formik} isRequired />
                    <FormDropDown
                        label="Program Type"
                        name="program_type"
                        placeholder={typeLoading ? "Loading..." : "Select Program Type"}
                        options={typeOptions}
                        formik={formik}
                        isRequired
                    />
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={formik.submitForm as any} disabled={loading}>
                        {loading && <LoaderIcon className="animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
