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
import { MASTER_DATA as TAGS } from "@/components/common/consts/tags.consts";
import { NewProgramTypeDialog } from "./components/NewProgramTypeDialog";
import { EditProgramTypeDialog } from "./components/EditProgramTypeDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ProgramTypeRecord = {
    name: string;
    title: string;
    program_category: string;
    is_active: 1 | 0;
};

export const ProgramTypeListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();
    const { sortHandler, optionHandler, headerHandler } = useCustomTable();

    usePageTitle("Program Types", "Browse and manage program types");

    const pageActions: PageHeaderActions = useMemo(() => [
        { text: "New Type", onClick: createDisclosure.onOpen, buttonVariant: "default" },
    ], [createDisclosure]);

    usePageActions(pageActions);

    const { data, isLoading, isValidating, mutate } = useFrappeGetCall(
        MASTER_DATA.PROGRAM_TYPE.LIST,
        {},
        MASTER_DATA.PROGRAM_TYPE.LIST
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = useCallback((record: ProgramTypeRecord) => {
        showConfirmationDialog({
            title: "Delete Program Type",
            description: "Are you sure you want to delete this Type?",
            onConfirm: () => {
                toast.promise(updateDoc("Program Type", record.name, { is_active: 0 }), {
                    loading: "Deleting...",
                    success() {
                        keyInvalidator([TAGS.PROGRAM_TYPE.LIST]);
                        setTimeout(() => mutate(), 500);
                        return "Deleted successfully";
                    },
                    error(err) { return frappeErrorHandler(err); }
                });
            },
        });
    }, [showConfirmationDialog, updateDoc, mutate]);

    const columns: ColumnDef<ProgramTypeRecord>[] = useMemo(() => [
        {
            accessorKey: "title",
            header: (ctx) => sortHandler({ context: ctx, text: "Title" }),
            cell: ({ row }) => <div>{row.original.title}</div>
        },
        {
            accessorKey: "program_category",
            header: (ctx) => sortHandler({ context: ctx, text: "Category" }),
            cell: ({ row }) => <div>{row.original.program_category}</div>
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
    ], [sortHandler, optionHandler, editDisclosure, headerHandler, handleDelete]);

    const records = useMemo(() => {
        const raw = Array.isArray(data) ? data : (data as any)?.message || [];
        return raw.filter((r: any) => r.is_active !== 0);
    }, [data]);

    return (
        <>
            <NewProgramTypeDialog disclosure={createDisclosure} onSuccess={() => mutate()} />
            <EditProgramTypeDialog disclosure={editDisclosure} onSuccess={() => mutate()} />
            <InnerPageContainer>
                <CustomTable
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    placeholder="No Program Types found."
                    searchable
                />
            </InnerPageContainer>
        </>
    );
};
