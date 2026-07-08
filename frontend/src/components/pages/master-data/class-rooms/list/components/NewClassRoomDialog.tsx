import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeCreateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import FormTextArea from "@/components/common/form-components/FormTextArea";
import { type UseDisclosureProps } from "@/components/hooks/useDisclosure";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type NewClassRoomDialogProps = {
    disclosure: UseDisclosureProps;
    onSuccess?: () => void;
};

export const NewClassRoomDialog: React.FC<NewClassRoomDialogProps> = ({ disclosure, onSuccess }) => {
    const { createDoc, loading } = useFrappeCreateDoc();

    const formik = useFormik({
        initialValues: { title: "", capacity: "", location: "", amenities: "" },
        validationSchema: Yup.object({
            title: Yup.string().trim().required("Name is required"),
            capacity: Yup.number().positive().required("Capacity is required"),
            location: Yup.string().trim().required("Location is required"),
        }),
        onSubmit(values, helpers) {
            const payload = {
                title: values.title.trim(),
                room_name: values.title.trim(),
                capacity: Number(values.capacity),
                custom_capacity: Number(values.capacity),
                location: values.location.trim(),
                custom_location: values.location.trim(),
                amenities: values.amenities.trim(),
                custom_amenities: values.amenities.trim(),
                is_active: 1,
            };

            toast.promise(createDoc("Class Room", payload), {
                loading: "Creating...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.CLASS_ROOM.LIST]);
                    if (onSuccess) setTimeout(() => onSuccess(), 500);
                    return "Created successfully";
                },
                error(err) { return frappeErrorHandler(err); }
            });
        },
    });

    return (
        <Dialog open={disclosure.isOpen} onOpenChange={(open) => !open && formik.resetForm() || disclosure.setIsOpen(open)}>
            <DialogContent className="min-w-125">
                <DialogHeader><DialogTitle>New Class Room</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                    <FormInput label="Name" name="title" formik={formik} isRequired />
                    <FormInput label="Capacity" name="capacity" type="number" formik={formik} isRequired />
                    <FormInput label="Location" name="location" formik={formik} isRequired />
                    <FormTextArea label="Amenities" name="amenities" formik={formik} />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => disclosure.onClose()}>Cancel</Button>
                    <Button onClick={formik.submitForm as any} disabled={loading}>{loading && <LoaderIcon className="animate-spin" />}Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};