import React, { useMemo } from "react";
import { useFormik } from "formik";
import { useFrappeGetCall, keyInvalidator, useFrappeUpdateDoc } from "frappe-react-hooks";
import { useMasterDataPost as useFrappePostCall } from "@/components/hooks/useMasterDataCalls";
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
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { NewResourcePersonTypeDialog } from "./components/NewResourcePersonTypeDialog";
import { EditResourcePersonTypeDialog } from "./components/EditResourcePersonTypeDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ResourcePersonTypeRecord = {
    name: string;
    resource_person_type_name: string;
    title?: string;
    is_active?: 1 | 0;
    creation?: string;
    modified?: string;
};

const initialArgs = {
    doctype: "Resource Person Type",
    fields: ["name", "resource_person_type_name", "title", "is_active", "creation", "modified"],
    limit: 100,
    order_by: "modified desc",
};

export const ResourcePersonTypeListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();

    const { sortHandler, optionHandler, headerHandler } = useCustomTable();
    const { payload, setRequestData } = useRequestData();

    usePageTitle("Resource Person Types", "Browse and manage resource person types");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Resource Person Type",
            onClick: () => createDisclosure.onOpen(),
            buttonVariant: "default",
        },
    ], []);

    usePageActions(pageActions);

    const filterFormik = useFormik({
        initialValues: {
            resource_person_type_name: "",
        },
        onSubmit: () => undefined,
    });

    const filterConfig: TableFilterType = useMemo(() => ({
        swrKeyPrefix: MASTER_DATA.RESOURCE_PERSON_TYPE.LIST,
        initialArgs,
        setRequestData,
        filterFormik,
        automaticFilterTriggers: true,
        filters: [
            {
                fieldName: "resource_person_type_name",
                label: "Resource Person Type Name",
                element: (
                    <FormInput
                        name="resource_person_type_name"
                        formik={filterFormik}
                        placeholder="Search type name..."
                    />
                ),
                filterCondition: ["resource_person_type_name", "like"],
            },
        ],
    }), [setRequestData, filterFormik]);

    const initialKey = `${MASTER_DATA.RESOURCE_PERSON_TYPE.LIST}-INITIAL`;

    const { data, isLoading, isValidating } = useFrappeGetCall(
        MASTER_DATA.RESOURCE_PERSON_TYPE.LIST,
        payload.args || initialArgs,
        payload.swrKey || initialKey
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = (record: ResourcePersonTypeRecord) => {
        showConfirmationDialog({
            title: "Delete Resource Person Type",
            description: "Are you sure you want to permanently delete this Resource Person Type record?",
            size: "sm",
            onConfirm: () => {
                toast.promise(updateDoc("Resource Person Type", record.name, { is_active: 0 }), {
                    loading: "Deleting resource person type...",
                    success() {
                        keyInvalidator([TAGS.RESOURCE_PERSON_TYPE.LIST]);
                        return "Resource Person Type deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    };

    const columns: ColumnDef<ResourcePersonTypeRecord>[] = useMemo(() => [
        {
            accessorKey: "resource_person_type_name",
            header: (ctx) => sortHandler({ context: ctx, text: "Name" }),
            cell: (ctx) => {
                const row = ctx.row.original;
                return (
                    <div className="font-medium">
                        {row.resource_person_type_name || row.title || row.name}
                    </div>
                );
            },
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
                            },
                        ],
                    })}
                </div>
            ),
        },
    ], [sortHandler, optionHandler, editDisclosure, headerHandler]);

    const records = useMemo(() => {
        if (!data) return [];
        return Array.isArray(data) ? data : (data as any).message || [];
    }, [data]);

    return (
        <>
            <NewResourcePersonTypeDialog disclosure={createDisclosure} />
            <EditResourcePersonTypeDialog disclosure={editDisclosure} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    filterConfig={filterConfig}
                    placeholder="No Resource Person Types found."
                    searchable
                    pagination={false}
                    showColumnFilters
                />
            </InnerPageContainer>
        </>
    );
};

export default ResourcePersonTypeListPage;
