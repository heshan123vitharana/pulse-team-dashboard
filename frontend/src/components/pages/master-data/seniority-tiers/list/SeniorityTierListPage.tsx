import React, { useMemo } from "react";
import { useFormik } from "formik";
import { useMasterDataGet as useFrappeGetCall, useMasterDataPost as useFrappePostCall, masterDataKeyInvalidator as keyInvalidator } from "@/components/hooks/useMasterDataCalls";
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
import { SENIORITY_TIER_METHODS } from "../seniority-tiers.methods";
import { SENIORITY_TIER_TAGS } from "../seniority-tiers.tags";
import { type SeniorityTierRecord } from "../seniority-tiers.types";
import { NewSeniorityTierDialog } from "./components/NewSeniorityTierDialog";
import { EditSeniorityTierDialog } from "./components/EditSeniorityTierDialog";
import { frappeErrorHandler } from "@/lib/general_utils";

const initialArgs = {
    doctype: "Seniority Tier",
    fields: ["name", "tier", "label", "default_hourly_rate", "is_active", "creation", "modified"],
    limit: 15,
    order_by: "tier asc",
};

export const SeniorityTierListPage: React.FC = () => {
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosureState();
    const { showConfirmationDialog } = useConfirmationDialog();

    const { sortHandler, optionHandler, headerHandler } = useCustomTable();
    const { payload, setRequestData } = useRequestData();

    usePageTitle("Seniority Tiers", "Browse and manage seniority tiers and default hourly rates");

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "New Seniority Tier",
            onClick: createDisclosure.onOpen,
            buttonVariant: "default",
        },
    ], [createDisclosure.onOpen]);

    usePageActions(pageActions);

    const filterFormik = useFormik({
        initialValues: {
            label: "",
        },
        onSubmit: () => undefined,
    });

    const filterConfig: TableFilterType = {
        swrKeyPrefix: SENIORITY_TIER_TAGS.GET_LIST,
        initialArgs,
        setRequestData,
        filterFormik,
        automaticFilterTriggers: true,
        filters: [
            {
                fieldName: "label",
                label: "Tier Label",
                element: (
                    <FormInput
                        name="label"
                        formik={filterFormik}
                        placeholder="Search tier label..."
                    />
                ),
                filterCondition: ["label", "like"],
            },
        ],
    };

    const initialKey = `${SENIORITY_TIER_TAGS.GET_LIST}-INITIAL`;

    const { data, isLoading, isValidating } = useFrappeGetCall(
        SENIORITY_TIER_METHODS.GET_LIST,
        payload.args || initialArgs,
        payload.swrKey || initialKey
    );

    const { call: updateTier } = useFrappePostCall(SENIORITY_TIER_METHODS.UPDATE);

    const handleDelete = (record: SeniorityTierRecord) => {
        showConfirmationDialog({
            title: "Delete Seniority Tier",
            description: `Are you sure you want to delete Seniority Tier "${record.label}"?`,
            size: "sm",
            onConfirm: () => {
                const updatedPayload = {
                    name: record.name,
                    tier: record.tier,
                    label: record.label,
                    default_hourly_rate: record.default_hourly_rate,
                    is_active: 0,
                };
                toast.promise(updateTier(updatedPayload), {
                    loading: "Deleting Seniority Tier...",
                    success() {
                        keyInvalidator([SENIORITY_TIER_TAGS.GET_LIST]);
                        return "Seniority Tier deleted successfully";
                    },
                    error(err) {
                        return frappeErrorHandler(err);
                    },
                });
            },
        });
    };

    const columns: ColumnDef<SeniorityTierRecord>[] = useMemo(() => [
        {
            accessorKey: "tier",
            header: (ctx) => sortHandler({ context: ctx, text: "Numeric Tier" }),
            cell: (ctx) => (
                <div className="font-semibold text-gray-700">
                    {ctx.getValue() as number}
                </div>
            ),
        },
        {
            accessorKey: "label",
            header: (ctx) => sortHandler({ context: ctx, text: "Label" }),
            cell: (ctx) => (
                <div className="font-medium">
                    {ctx.getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "default_hourly_rate",
            header: (ctx) => sortHandler({ context: ctx, text: "Default Hourly Rate (LKR)" }),
            cell: (ctx) => (
                <div className="font-mono text-gray-600">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "LKR", minimumFractionDigits: 0 }).format(ctx.getValue() as number)}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => headerHandler("Actions", "end"),
            cell: ({ row }) => optionHandler({
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
            }),
        },
    ], [sortHandler, optionHandler, editDisclosure]);

    const records = useMemo(() => data?.message || [], [data]);

    return (
        <>
            <NewSeniorityTierDialog disclosure={createDisclosure} />
            <EditSeniorityTierDialog disclosure={editDisclosure} />

            <InnerPageContainer>
                <CustomTable
                    virtualized
                    containerClassName="overflow-y-auto max-h-[calc(100vh-405px)]"
                    columns={columns}
                    data={records}
                    isLoading={isLoading || isValidating}
                    filterConfig={filterConfig}
                    placeholder="No Seniority Tiers found."
                    searchable
                />
            </InnerPageContainer>
        </>
    );
};

export default SeniorityTierListPage;
