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

type NewModuleGroupDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewModuleGroupDialog: React.FC<NewModuleGroupDialogProps> = ({ disclosure }) => {
    const { call: createGroup, loading } = useFrappePostCall(MASTER_DATA.MODULE_GROUP.CREATE);

    const formik = useFormik({
        initialValues: {
            group_name: "",
        },
        validationSchema: Yup.object({
            group_name: Yup.string()
                .trim()
                .required("Module Group Name is required"),
        }),
        onSubmit(values, helpers) {
            const groupName = values.group_name.trim();
            const payload = {
                title: groupName,
            };

            toast.promise(createGroup(payload), {
                loading: "Creating Module Group...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.MODULE_GROUP.LIST]);
                    return "Module Group created successfully";
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
                    <DialogTitle>New Module Group</DialogTitle>
                    <DialogDescription>
                        Add a new Module Group. Name must be unique.
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
