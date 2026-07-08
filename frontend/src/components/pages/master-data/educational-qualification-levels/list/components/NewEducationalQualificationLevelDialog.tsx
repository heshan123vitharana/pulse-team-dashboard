import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMasterDataPost as useFrappePostCall, masterDataKeyInvalidator as keyInvalidator } from "@/components/hooks/useMasterDataCalls";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureProps } from "@/components/hooks/useDisclosure";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type NewEducationalQualificationLevelDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewEducationalQualificationLevelDialog: React.FC<NewEducationalQualificationLevelDialogProps> = ({ disclosure }) => {
    const { call: createLevel, loading } = useFrappePostCall(MASTER_DATA.EDUCATIONAL_QUALIFICATION_LEVEL.CREATE);

    const formik = useFormik({
        initialValues: {
            level_name: "",
        },
        validationSchema: Yup.object({
            level_name: Yup.string()
                .trim()
                .required("Level Name is required"),
        }),
        onSubmit(values, helpers) {
            const levelName = values.level_name.trim();
            const payload = {
                title: levelName,
            };

            toast.promise(createLevel(payload), {
                loading: "Creating Qualification Level...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.EDUCATIONAL_QUALIFICATION_LEVEL.LIST]);
                    return "Qualification Level created successfully";
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
                    <DialogTitle>New Qualification Level</DialogTitle>
                    <DialogDescription>
                        Add a new Educational Qualification Level (e.g. Diploma, Bachelor's). Name must be unique.
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
