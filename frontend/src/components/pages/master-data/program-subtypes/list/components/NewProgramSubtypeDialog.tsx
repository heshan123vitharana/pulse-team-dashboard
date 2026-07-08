import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMasterDataPost as useFrappePostCall, masterDataKeyInvalidator as keyInvalidator } from "@/components/hooks/useMasterDataCalls";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/form-components/FormInput";
import FormDropDown from "@/components/common/form-components/FormDropDown";
import { type UseDisclosureProps } from "@/components/hooks/useDisclosure";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { frappeErrorHandler } from "@/lib/general_utils";
import { LoaderIcon } from "lucide-react";

type NewProgramSubtypeDialogProps = {
    disclosure: UseDisclosureProps;
};

export const NewProgramSubtypeDialog: React.FC<NewProgramSubtypeDialogProps> = ({ disclosure }) => {
    const { call: createSubtype, loading } = useFrappePostCall(MASTER_DATA.PROGRAM_SUBTYPE.CREATE);
    const { call: searchTypes, loading: typeLoading } = useFrappePostCall(MASTER_DATA.PROGRAM_SUBTYPE.TYPE_DD);

    const [typeOptions, setTypeOptions] = React.useState<{ label: string; value: string }[]>([]);

    React.useEffect(() => {
        if (disclosure.isOpen) {
            searchTypes({})
                .then((res: any) => {
                    const rawTypes = Array.isArray(res) ? res : res?.message || [];
                    setTypeOptions(rawTypes);
                })
                .catch((err) => console.error(err));
        }
    }, [disclosure.isOpen]);

    const formik = useFormik({
        initialValues: {
            title: "",
            program_type: "",
        },
        validationSchema: Yup.object({
            title: Yup.string().trim().required("Title is required"),
            program_type: Yup.string().required("Program Type is required"),
        }),
        onSubmit(values, helpers) {
            const payload = {
                title: values.title.trim(),
                program_type: values.program_type,
            };

            toast.promise(createSubtype(payload), {
                loading: "Creating Program Subtype...",
                success() {
                    helpers.resetForm();
                    disclosure.onClose();
                    keyInvalidator([TAGS.PROGRAM_SUBTYPE.LIST]);
                    return "Program Subtype created successfully";
                },
                error(err) {
                    return frappeErrorHandler(err);
                },
            });
        },
    });

    return (
        <Dialog open={disclosure.isOpen} onOpenChange={disclosure.setIsOpen}>
            <DialogContent className="min-w-125">
                <DialogHeader>
                    <DialogTitle>New Program Subtype</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <Button variant="secondary" onClick={() => disclosure.onClose()}>Cancel</Button>
                    <Button onClick={formik.submitForm as any} disabled={loading}>
                        {loading && <LoaderIcon className="animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
