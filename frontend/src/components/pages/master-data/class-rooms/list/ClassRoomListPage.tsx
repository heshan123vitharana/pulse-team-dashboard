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
import { NewClassRoomDialog } from "./components/NewClassRoomDialog";
import { EditClassRoomDialog } from "./components/EditClassRoomDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

export type ClassRoomRecord = {
    name: string;
    room_name: string;
    title: string;
    capacity: number;
    custom_capacity: number;
    location: string;
    custom_location: string;
    amenities: string;
    custom_amenities: string;
    is_active: 1 | 0;
    creation?: string;
    modified?: string;
};

export const ClassRoomListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();
    const { sortHandler, optionHandler, headerHandler } = useCustomTable();

    usePageTitle("Class Rooms", "Browse and manage classrooms");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Class Room",
            onClick: createDisclosure.onOpen,
            buttonVariant: "default",
        },
    ], [createDisclosure]);

    usePageActions(pageActions);

    const initialKey = `${MASTER_DATA.CLASS_ROOM.LIST}`;

    const { data, isLoading, isValidating, mutate } = useFrappeGetCall(
        MASTER_DATA.CLASS_ROOM.LIST,
        {},
        initialKey
    );

    const { updateDoc } = useFrappeUpdateDoc();

    const handleDelete = useCallback((record: ClassRoomRecord) => {
        showConfirmationDialog({
            title: "Delete Class Room",
            description: "Are you sure you want to delete this Class Room record?",
            size: "sm",
            onConfirm: () => {
                toast.promise(updateDoc("Class Room", record.name, { is_active: 0 }), {
                    loading: "Deleting class room...",
                    success() {
                        keyInvalidator([TAGS.CLASS_ROOM.LIST]);
                        setTimeout(() => mutate(), 500);
                        return "Class Room deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    }, [showConfirmationDialog, updateDoc, mutate]);

    const columns: ColumnDef<ClassRoomRecord>[] = useMemo(() => [
        {
            accessorKey: "title",
            header: (ctx) => sortHandler({ context: ctx, text: "Name" }),
            cell: (ctx) => <div className="font-medium">{ctx.row.original.title || ctx.row.original.name}</div>,
        },
        {
            accessorKey: "capacity",
            header: (ctx) => sortHandler({ context: ctx, text: "Capacity" }),
        },
        {
            accessorKey: "location",
            header: (ctx) => sortHandler({ context: ctx, text: "Location" }),
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => headerHandler("Actions", "end"),
            cell: ({ row }) => (
                <div className="flex justify-end">
                    {optionHandler({
                        options: [
                            { text: "Edit", onClick: () => editDisclosure.onOpen(row.original) },
                            { text: "Delete", onClick: () => handleDelete(row.original), isDisabled: row.original.is_active === 0 },
                        ],
                    })}
                </div>
            ),
        },
    ], [sortHandler, optionHandler, editDisclosure, headerHandler, handleDelete]);

    const records = useMemo(() => {
        const rawRecords = Array.isArray(data) ? data : (data as any)?.message || [];
        return rawRecords.filter((r: any) => r.is_active !== 0);
    }, [data]);

    return (
        <>
            <NewClassRoomDialog disclosure={createDisclosure} onSuccess={() => mutate()} />
            <EditClassRoomDialog disclosure={editDisclosure} onSuccess={() => mutate()} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    placeholder="No Class Rooms found."
                    searchable
                    pagination={false}
                    showColumnFilters
                />
            </InnerPageContainer>
        </>
    );
};

export default ClassRoomListPage;
