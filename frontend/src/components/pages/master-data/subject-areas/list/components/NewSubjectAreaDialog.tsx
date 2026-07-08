import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappePostCall, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureProps } from "@/components/hooks/useDisclosure";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type NewSubjectAreaDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewSubjectAreaDialog: React.FC<NewSubjectAreaDialogProps> = ({ disclosure }) => {
    const { call: createArea, loading } = useFrappePostCall(MASTER_DATA.SUBJECT_AREA.CREATE);

    const formik = useFormik({
        initialValues: {
            area_name: "",
        },
        validationSchema: Yup.object({
            area_name: Yup.string()
                .trim()
                .required("Subject Area Name is required"),
        }),
        onSubmit(values, helpers) {
            const payload = {
                area_name: values.area_name.trim(),
                is_active: 1,
            };

            toast.promise(createArea(payload), {
                loading: "Creating Subject Area...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([MASTER_DATA.SUBJECT_AREA.LIST]);
                    return "Subject Area created successfully";
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
                    <DialogTitle>New Subject Area</DialogTitle>
                    <DialogDescription>
                        Add a new Subject Area (e.g. HR Development, Financial Analysis). Name must be unique.
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
