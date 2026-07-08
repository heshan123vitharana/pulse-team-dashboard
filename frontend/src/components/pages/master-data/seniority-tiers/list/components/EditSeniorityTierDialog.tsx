import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { masterDataKeyInvalidator as keyInvalidator } from "@/components/hooks/useMasterDataCalls";
import { useFrappeUpdateDoc } from "frappe-react-hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import { type UseDisclosureStateProps } from "@/components/hooks/useDisclosureState";
import { SENIORITY_TIER_METHODS } from "../../seniority-tiers.methods";
import { SENIORITY_TIER_TAGS } from "../../seniority-tiers.tags";
import { type SeniorityTierRecord } from "@/components/pages/master-data/seniority-tiers/seniority-tiers.types";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type EditSeniorityTierDialogProps = {
    disclosure: UseDisclosureStateProps;
};

export const EditSeniorityTierDialog: React.FC<EditSeniorityTierDialogProps> = ({ disclosure }) => {
    const record = disclosure.state as SeniorityTierRecord | null;
    const { updateDoc, loading } = useFrappeUpdateDoc();

    const formik = useFormik({
        initialValues: {
            tier: "",
            label: "",
            default_hourly_rate: "",
        },
        validationSchema: Yup.object({
            tier: Yup.number()
                .integer("Tier must be a whole number")
                .positive("Tier must be a positive number")
                .required("Numeric Tier is required"),
            label: Yup.string()
                .trim()
                .required("Label is required"),
            default_hourly_rate: Yup.number()
                .min(0, "Hourly rate cannot be negative")
                .required("Default Hourly Rate (LKR) is required"),
        }),
        onSubmit(values) {
            if (!record) return;

            const updatePromise = async () => {
                await updateDoc("Seniority Tier", record.name, {
                    tier: Number(values.tier),
                    label: values.label.trim(),
                    default_hourly_rate: Number(values.default_hourly_rate),
                    is_active: record.is_active,
                });
            };

            toast.promise(updatePromise(), {
                loading: "Updating Seniority Tier...",
                success() {
                    formik.resetForm();
                    disclosure.onClose();
                    keyInvalidator([SENIORITY_TIER_TAGS.GET_LIST]);
                    return "Seniority Tier updated successfully";
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
                tier: String(record.tier || ""),
                label: record.label || "",
                default_hourly_rate: String(record.default_hourly_rate || ""),
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
                    <DialogTitle>Edit Seniority Tier</DialogTitle>
                    <DialogDescription>
                        Update the selected seniority tier definition.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <FormInput
                        label="Numeric Tier (1..N)"
                        name="tier"
                        type="number"
                        placeholder="e.g. 1"
                        formik={formik}
                        isRequired
                    />
                    <FormInput
                        label="Tier Label"
                        name="label"
                        placeholder="e.g. Senior Lecturer, Assistant"
                        formik={formik}
                        isRequired
                    />
                    <FormInput
                        label="Default Hourly Rate (LKR)"
                        name="default_hourly_rate"
                        type="number"
                        placeholder="e.g. 2500"
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
