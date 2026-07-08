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
import { NewServiceDialog } from "./components/NewServiceDialog";
import { EditServiceDialog } from "./components/EditServiceDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ServiceRecord = {
    name: string;
    service_name: string;
    title?: string;
    is_active?: 1 | 0;
    creation?: string;
    modified?: string;
};

const initialArgs = {
    doctype: "Service",
    fields: ["name", "service_name", "title", "is_active", "creation", "modified"],
    limit: 100,
    order_by: "modified desc",
};

export const ServiceListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();

    const { sortHandler, optionHandler, headerHandler } = useCustomTable();
    const { payload, setRequestData } = useRequestData();

    usePageTitle("Services", "Browse and manage student government service classifications");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Service",
            onClick: () => createDisclosure.onOpen(),
            buttonVariant: "default",
        },
    ], []);

    usePageActions(pageActions);

    const filterFormik = useFormik({
        initialValues: {
            service_name: "",
        },
        onSubmit: () => undefined,
    });

    const filterConfig: TableFilterType = useMemo(() => ({
        swrKeyPrefix: MASTER_DATA.SERVICE.LIST,
        initialArgs,
        setRequestData,
        filterFormik,
        automaticFilterTriggers: true,
        filters: [
            {
                fieldName: "service_name",
                label: "Service Name",
                element: (
                    <FormInput
                        name="service_name"
                        formik={filterFormik}
                        placeholder="Search service name..."
                    />
                ),
                filterCondition: ["service_name", "like"],
            },
        ],
    }), [setRequestData, filterFormik]);

    const initialKey = `${MASTER_DATA.SERVICE.LIST}-INITIAL`;

    const { data, isLoading, isValidating } = useFrappeGetCall(
        MASTER_DATA.SERVICE.LIST,
        payload.args || initialArgs,
        payload.swrKey || initialKey
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = (record: ServiceRecord) => {
        showConfirmationDialog({
            title: "Delete Service",
            description: "Are you sure you want to permanently delete this Service Classification record?",
            size: "sm",
            onConfirm: () => {
                toast.promise(updateDoc("Service", record.name, { is_active: 0 }), {
                    loading: "Deleting Service...",
                    success() {
                        keyInvalidator([TAGS.SERVICE.LIST]);
                        return "Service deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    };

    const columns: ColumnDef<ServiceRecord>[] = useMemo(() => [
        {
            accessorKey: "service_name",
            header: (ctx) => sortHandler({ context: ctx, text: "Service Name" }),
            cell: (ctx) => {
                const row = ctx.row.original;
                return (
                    <div className="font-medium">
                        {row.service_name || row.title || row.name}
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
            <NewServiceDialog disclosure={createDisclosure} />
            <EditServiceDialog disclosure={editDisclosure} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    filterConfig={filterConfig}
                    placeholder="No Services found."
                    searchable
                    pagination={false}
                    showColumnFilters
                />
            </InnerPageContainer>
        </>
    );
};

export default ServiceListPage;
