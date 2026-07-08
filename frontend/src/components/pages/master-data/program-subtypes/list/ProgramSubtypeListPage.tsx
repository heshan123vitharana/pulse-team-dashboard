import React, { useMemo, useCallback } from "react";
import { useFrappeGetCall, useFrappeUpdateDoc, keyInvalidator } from "frappe-react-hooks";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { usePageTitle } from "@/components/hooks/usePageTitle";
import { usePageActions, type PageHeaderActions } from "@/components/hooks/usePageActions";
import { useCustomTable } from "@/components/hooks/useCustomTable";
import useDisclosure from "@/components/hooks/useDisclosure";
import useDisclosureState from "@/components/hooks/useDisclosureState";
import { useConfirmationDialog } from "@/components/hooks/useConfirmationDialog";
import { CustomTable } from "@/components/common/custom-table/CustomTable";
import InnerPageContainer from "@/components/common/InnerPageContainer";
import { MASTER_DATA } from "@/components/common/consts/methods.consts";
import { NewProgramSubtypeDialog } from "./components/NewProgramSubtypeDialog";
import { EditProgramSubtypeDialog } from "./components/EditProgramSubtypeDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ProgramSubtypeRecord = {
    name: string;
    title: string;
    program_type: string;
    is_active: 1 | 0;
    creation?: string;
    modified?: string;
};

const emptyFetchArgs = {};

export const ProgramSubtypeListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();
    const { sortHandler, headerHandler, optionHandler } = useCustomTable();

    usePageTitle("Program Subtypes", "Browse and manage program subtypes");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Subtype",
            onClick: () => createDisclosure.onOpen(),
            buttonVariant: "default",
        },
    ], []);

    usePageActions(pageActions);

    const { data, isLoading, mutate } = useFrappeGetCall(
        MASTER_DATA.PROGRAM_SUBTYPE.LIST,
        emptyFetchArgs,
        MASTER_DATA.PROGRAM_SUBTYPE.LIST
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = useCallback((record: any) => {
        showConfirmationDialog({
            title: "Delete Program Subtype",
            description: "Are you sure you want to delete this record?",
            onConfirm: () => {
                toast.promise(updateDoc("Program Sub Type", record.name, { is_active: 0 }), {
                    loading: "Deleting...",
                    success() {
                        keyInvalidator([MASTER_DATA.PROGRAM_SUBTYPE.LIST]);
                        setTimeout(() => mutate(), 500);
                        return "Deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    }
                });
            }
        });
    }, [showConfirmationDialog, updateDoc, mutate]);

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            id: "name",
            header: (ctx) => sortHandler({ context: ctx, text: "Name" }),
            cell: ({ row }) => {
                const record = row.original;
                return <span>{record?.title || record?.subtype_name || record?.name || "-"}</span>;
            }
        },
        {
            accessorKey: "program_type",
            header: (ctx) => sortHandler({ context: ctx, text: "Program Type" }),
        },
        {
            id: "actions",
            header: () => headerHandler("Actions", "end"),
            cell: ({ row }) => (
                <div className="flex justify-end">
                    {optionHandler({
                        options: [
                            { text: "Edit", onClick: () => editDisclosure.onOpen(row.original) },
                            { text: "Delete", onClick: () => handleDelete(row.original) },
                        ],
                    })}
                </div>
            ),
        },
    ], [sortHandler, headerHandler, optionHandler, editDisclosure.onOpen, handleDelete]);

    const records = useMemo(() => {
        if (!data) return [];
        const allRecords = Array.isArray(data) ? data : (data as any)?.message;
        if (!Array.isArray(allRecords)) return [];
        return allRecords.filter((record: any) => record?.is_active !== 0);
    }, [data]);

    return (
        <>
            <NewProgramSubtypeDialog disclosure={createDisclosure} />
            <EditProgramSubtypeDialog disclosure={editDisclosure} onSuccess={() => mutate()} />

            <InnerPageContainer>
                <CustomTable
                    columns={columns}
                    data={records}
                    isLoading={isLoading}
                    placeholder="No Program Subtypes found."
                    searchable
                    pagination={true}
                    showColumnFilters
                />
            </InnerPageContainer>
        </>
    );
};

export default ProgramSubtypeListPage;
