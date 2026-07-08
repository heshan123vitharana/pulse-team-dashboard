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
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { NewModuleBasketTypeDialog } from "./components/NewModuleBasketTypeDialog";
import { EditModuleBasketTypeDialog } from "./components/EditModuleBasketTypeDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ModuleBasketTypeRecord = {
    name: string;
    basket_type_name: string;
    title?: string;
    is_active: 1 | 0;
    creation?: string;
    modified?: string;
};

const initialArgs = {
    doctype: "Module Basket Type",
    fields: ["name", "basket_type_name", "title", "is_active", "creation", "modified"],
    filters: [["is_active", "=", 1]],
    limit: 100,
    order_by: "modified desc",
};

export const ModuleBasketTypeListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();

    const { sortHandler, optionHandler, headerHandler } = useCustomTable();
    const { payload, setRequestData } = useRequestData();

    usePageTitle("Module Basket Types", "Browse and manage module basket types");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Basket Type",
            onClick: createDisclosure.onOpen,
            buttonVariant: "default",
        },
    ], []);

    usePageActions(pageActions);

    const filterFormik = useFormik({
        initialValues: {
            basket_type_name: "",
        },
        onSubmit: () => undefined,
    });

    const filterConfig: TableFilterType = useMemo(() => ({
        swrKeyPrefix: MASTER_DATA.MODULE_BASKET_TYPE.LIST,
        initialArgs,
        setRequestData,
        filterFormik,
        automaticFilterTriggers: true,
        filters: [
            {
                fieldName: "basket_type_name",
                label: "Basket Type Name",
                element: (
                    <FormInput
                        name="basket_type_name"
                        formik={filterFormik}
                        placeholder="Search basket type name..."
                    />
                ),
                filterCondition: ["basket_type_name", "like"],
            },
        ],
    }), [setRequestData, filterFormik]);

    const initialKey = `${MASTER_DATA.MODULE_BASKET_TYPE.LIST}`;

    const currentArgs = useMemo(() => {
        const args = payload.args || initialArgs;
        const currentFilters = args.filters || [];
        const hasActiveFilter = currentFilters.some((f: any) => f[0] === "is_active");
        if (!hasActiveFilter) {
            args.filters = [...currentFilters, ["is_active", "=", 1]];
        }
        return args;
    }, [payload.args]);

    const { data, isLoading, isValidating } = useFrappeGetCall(
        MASTER_DATA.MODULE_BASKET_TYPE.LIST,
        currentArgs,
        initialKey
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = (record: ModuleBasketTypeRecord) => {
        showConfirmationDialog({
            title: "Delete Module Basket Type",
            description: "Are you sure you want to delete this Basket Type?",
            size: "sm",
            onConfirm: () => {
                toast.promise(updateDoc("Module Basket Type", record.name, { is_active: 0 }), {
                    loading: "Deleting basket type...",
                    success() {
                        keyInvalidator([TAGS.MODULE_BASKET_TYPE.LIST]);
                        return "Module Basket Type deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    };

    const columns: ColumnDef<ModuleBasketTypeRecord>[] = useMemo(() => [
        {
            accessorKey: "basket_type_name",
            header: (ctx) => sortHandler({ context: ctx, text: "Name" }),
            cell: (ctx) => {
                const row = ctx.row.original;
                return (
                    <div className="font-medium">
                        {row.basket_type_name || row.title || row.name}
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
                                isDisabled: row.original.is_active === 0,
                            },
                        ],
                    })}
                </div>
            ),
        },
    ], [sortHandler, optionHandler, editDisclosure]);

    const records = useMemo(() => {
        const rawRecords = data?.message || [];
        return rawRecords.filter((r: any) => r.is_active !== 0);
    }, [data]);

    return (
        <>
            <NewModuleBasketTypeDialog disclosure={createDisclosure} />
            <EditModuleBasketTypeDialog disclosure={editDisclosure} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    filterConfig={filterConfig}
                    placeholder="No Module Basket Types found."
                    searchable
                    pagination={false}
                    showColumnFilters
                />
            </InnerPageContainer>
        </>
    );
};

export default ModuleBasketTypeListPage;
