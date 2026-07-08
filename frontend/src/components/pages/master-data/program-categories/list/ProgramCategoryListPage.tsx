import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { PROGRAM_CATEGORY_STATUS_COLORS } from "../program-categories.data";
import { NewProgramCategoryDialog } from "./components/NewProgramCategoryDialog";
import { EditProgramCategoryDialog } from "./components/EditProgramCategoryDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ProgramCategoryRecord = {
    name: string;
    title: string;
    is_active: 1 | 0;
    creation?: string;
    modified?: string;
};

export const ProgramCategoryListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();
    const { sortHandler, optionHandler, badgeHandler, headerHandler } = useCustomTable();

    usePageTitle("Program Categories", "Browse and manage program categories");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Category",
            onClick: createDisclosure.onOpen,
            buttonVariant: "default",
        },
    ], []);

    usePageActions(pageActions);

    const initialKey = `${MASTER_DATA.PROGRAM_CATEGORY.LIST}`;

    const { data, isLoading, isValidating } = useFrappeGetCall(
        MASTER_DATA.PROGRAM_CATEGORY.LIST,
        {},
        initialKey
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = (record: ProgramCategoryRecord) => {
        showConfirmationDialog({
            title: "Delete Program Category",
            description: "Are you sure you want to delete this Category?",
            size: "sm",
            onConfirm: () => {
                toast.promise(updateDoc("Program Category", record.name, { is_active: 0 }), {
                    loading: "Deleting category...",
                    success() {
                        keyInvalidator([MASTER_DATA.PROGRAM_CATEGORY.LIST]);
                        return "Program Category deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    };

    const columns: ColumnDef<ProgramCategoryRecord>[] = useMemo(() => [
        {
            accessorKey: "title",
            header: (ctx) => sortHandler({ context: ctx, text: "Name" }),
            cell: (ctx) => {
                const row = ctx.row.original;
                return (
                    <div className="font-medium">
                        {row.title || (row as any).category_name || row.name}
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
    ], [sortHandler, optionHandler, badgeHandler, editDisclosure]);

    const records = useMemo(() => data?.message || [], [data]);

    return (
        <>
            <NewProgramCategoryDialog disclosure={createDisclosure} />
            <EditProgramCategoryDialog disclosure={editDisclosure} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    placeholder="No Program Types found."
                    searchable
                    pagination={false}
                    showColumnFilters
                />
            </InnerPageContainer>
        </>
    );
};
