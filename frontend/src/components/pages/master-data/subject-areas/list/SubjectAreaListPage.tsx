import React, { useMemo } from "react";
import { useFormik } from "formik";
import { useFrappeGetCall, useFrappeUpdateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { usePageTitle } from "@/components/hooks/usePageTitle";
import { usePageActions, type PageHeaderActions } from "@/components/hooks/usePageActions";
import { useCustomTable } from "@/components/hooks/useCustomTable";
import { useRequestData } from "@/components/hooks/useRequestData";
import { type TableFilterType } from "@/components/hooks/useTableFilters";
import useDisclosure from "@/components/hooks/useDisclosure";
import useDisclosureState from "@/components/hooks/useDisclosureState";
import { useConfirmationDialog } from "@/components/hooks/useConfirmationDialog";
import { CustomTable } from "@/components/common/custom-table/CustomTable";
import InnerPageContainer from "@/components/common/InnerPageContainer";
import FormInput from "@/components/common/form-components/FormInput";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { NewSubjectAreaDialog } from "./components/NewSubjectAreaDialog";
import { EditSubjectAreaDialog } from "./components/EditSubjectAreaDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type SubjectAreaRecord = {
    name: string;
    area_name: string;
    is_active: 1 | 0;
    creation?: string;
    modified?: string;
};

const initialArgs = {
    doctype: "Subject Area",
    fields: ["name", "area_name", "is_active", "creation", "modified"],
    limit: 15,
    order_by: "modified desc",
};

export const SubjectAreaListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();

    const { sortHandler, optionHandler, headerHandler } = useCustomTable();
    const { payload, setRequestData } = useRequestData();

    usePageTitle("Subject Areas", "Browse and manage resource person subject areas");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Area",
            onClick: createDisclosure.onOpen,
            buttonVariant: "default",
        },
    ], []);

    usePageActions(pageActions);

    const filterFormik = useFormik({
        initialValues: {
            area_name: "",
        },
        onSubmit: () => undefined,
    });

    const filterConfig: TableFilterType = useMemo(() => ({
        swrKeyPrefix: MASTER_DATA.SUBJECT_AREA.LIST,
        initialArgs,
        setRequestData,
        filterFormik,
        automaticFilterTriggers: true,
        filters: [
            {
                fieldName: "area_name",
                label: "Area Name",
                element: (
                    <FormInput
                        name="area_name"
                        formik={filterFormik}
                        placeholder="Search area name..."
                    />
                ),
                filterCondition: ["area_name", "like"],
            },
        ],
    }), [setRequestData, filterFormik]);

    const initialKey = `${MASTER_DATA.SUBJECT_AREA.LIST}-INITIAL`;

    const { data, isLoading, isValidating } = useFrappeGetCall(
        MASTER_DATA.SUBJECT_AREA.LIST,
        payload.args || initialArgs,
        payload.swrKey || initialKey
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = (record: SubjectAreaRecord) => {
        showConfirmationDialog({
            title: "Delete Subject Area",
            description: "Are you sure you want to delete this Subject Area?",
            size: "sm",
            onConfirm: () => {
                toast.promise(updateDoc("Subject Area", record.name, { is_active: 0 }), {
                    loading: "Deleting Subject Area...",
                    success() {
                        keyInvalidator([MASTER_DATA.SUBJECT_AREA.LIST]);
                        return "Subject Area deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    };

    const columns: ColumnDef<SubjectAreaRecord>[] = useMemo(() => [
        {
            accessorKey: "area_name",
            header: (ctx) => sortHandler({ context: ctx, text: "Area Name" }),
            cell: (ctx) => (
                <div className="font-medium">
                    {ctx.getValue() as string}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => headerHandler("Actions", "end"),
            cell: ({ row }) => (
                <div className="flex justify-end">
                    {optionHandler({
                        options: [
                            {
                                text: "Edit",
                                onClick: () => editDisclosure.onOpen(row.original),
                            },
                            {
                                text: "Delete",
                                onClick: () => handleDelete(row.original),
                                isDisabled: row.original.is_active === 0,
                            },
                        ],
                    })}
                </div>
            ),
        },
    ], [sortHandler, optionHandler, editDisclosure]);

    const records = useMemo(() => data?.message || [], [data]);

    return (
        <>
            <NewSubjectAreaDialog disclosure={createDisclosure} />
            <EditSubjectAreaDialog disclosure={editDisclosure} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    filterConfig={filterConfig}
                    placeholder="No Subject Areas found."
                    searchable
                />
            </InnerPageContainer>
        </>
    );
};

export default SubjectAreaListPage;
