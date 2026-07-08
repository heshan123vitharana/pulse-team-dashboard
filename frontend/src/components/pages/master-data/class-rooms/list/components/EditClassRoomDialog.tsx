import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFrappeUpdateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import FormTextArea from "@/components/common/form-components/FormTextArea";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { type ClassRoomRecord } from "../ClassRoomListPage";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditClassRoomDialogProps = {
    disclosure: UseDisclosureStateProps;
    onSuccess?: () => void;
};

export const EditClassRoomDialog: React.FC<EditClassRoomDialogProps> = ({ disclosure, onSuccess }) => {
    const record = disclosure.state as ClassRoomRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            room_name: record ? (record.room_name || record.title || record.name || "") : "",
            capacity: record ? String(record.capacity || record.custom_capacity || "") : "",
            location: record ? (record.location || record.custom_location || "") : "",
            amenities: record ? (record.amenities || record.custom_amenities || "") : "",
        },
        validationSchema: Yup.object({
            room_name: Yup.string().trim().required("Class Room Name is required"),
            capacity: Yup.number().typeError("Must be a number").positive().integer().required("Capacity is required"),
            location: Yup.string().trim().required("Location is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updateProcess = async () => {
                const newRoomName = values.room_name.trim();
                await updateDoc("Class Room", record.name, {
                    title: newRoomName,
                    room_name: newRoomName,
                    capacity: Number(values.capacity),
                    custom_capacity: Number(values.capacity),
                    location: values.location.trim(),
                    custom_location: values.location.trim(),
                    amenities: values.amenities.trim(),
                    custom_amenities: values.amenities.trim(),
                });
            };

            toast.promise(updateProcess(), {
                loading: "Updating...",
                success() {
                    disclosure.onClose();
                    keyInvalidator([TAGS.CLASS_ROOM.LIST]);
                    if (onSuccess) setTimeout(() => onSuccess(), 500);
                    return "Updated successfully";
                },
                error(err) { return frappeErrorHandler(err); }
            });
        },
    });

    return (
        <Dialog open={disclosure.isOpen} onOpenChange={(open) => {
            if (!open) {
                formik.resetForm();
                disclosure.onClose();
            } else {
                disclosure.setIsOpen(true);
            }
        }}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>Edit Class Room</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormInput label="Class Room Name" name="room_name" formik={formik} isRequired />
                    <FormInput label="Capacity" name="capacity" type="number" formik={formik} isRequired />
                    <FormInput label="Location" name="location" formik={formik} isRequired />
                    <FormTextArea label="Amenities" name="amenities" formik={formik} />
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