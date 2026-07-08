import { CustomTable } from "@/components/common/custom-table/CustomTable"
import FormDatePicker from "@/components/common/form-components/FormDatePicker"
import FormDropDown from "@/components/common/form-components/FormDropDown"
import FormInput from "@/components/common/form-components/FormInput"
import { Panel } from "@/components/common/panel/Panel"
import TupleCard from "@/components/common/tuple-card/TupleCard"
import TupleCardLine, { type EditableTupleCardLineDateProps } from "@/components/common/tuple-card/TupleCardLine"
import { useConfirmationDialog } from "@/components/hooks/useConfirmationDialog"
import { useCustomTable } from "@/components/hooks/useCustomTable"
import { useFormikX } from "@/components/hooks/useFormikX"
import { usePageActions, type PageHeaderActions } from "@/components/hooks/usePageActions"
import { usePageTitle } from "@/components/hooks/usePageTitle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BADGE_CLASSES } from "@/lib/general_utils"
import { DashboardIcon, ViewHorizontalIcon } from "@radix-ui/react-icons"
import type { ColumnDef } from "@tanstack/react-table"
import moment from "moment"
import { useMemo } from "react"
import * as Yup from "yup"
import { dummyData, type ItemRow } from "./home-data"
import { ActivityIcon, Mail, Printer, SaveAllIcon, SettingsIcon, SheetIcon, X } from "lucide-react"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import MessageBox from "@/components/common/message-box/MessageBox"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "@/components/theme-provider"
import type { CustomTableFilterType } from "@/components/hooks/useTableFilters"
import { useRequestData } from "@/components/hooks/useRequestData"
import HomeStats from "./components/HomeStats"
import { Separator } from "@/components/ui/separator"

const initialArgs = {
    limit: 15,
    orderBy: {
        field: 'creation',
        order: 'desc',
    },
}

export const HomePage = () => {
    const theme = useTheme()
    const { sortHandler } = useCustomTable()
    const { payload, setRequestData } = useRequestData();
    const { showConfirmationDialog } = useConfirmationDialog()
    usePageTitle("Home", "Manage your company's items")

    const formikX = useFormikX({
        initialValues: {
            "gender": "male"
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            gender: Yup.string().required("Gender is required"),
            date: Yup.string().required("Date is required")
        }),
        onSubmit() { }
    })

    const formik = formikX.formik

    const editableConfigs = {
        posting_date: {
            formikX,
            name: "posting_date",
            helpText: "Change the posting date and click save to save the changes",
            type: "date",
            onSave: formikX.formik.submitForm
        } as EditableTupleCardLineDateProps,
    }

    const pageActions: PageHeaderActions = useMemo(() => [
        {
            text: "Disabled Button",
            onClick: () => { },
            buttonVariant: "default",
            isDisabled: true,
        },
        {
            text: "Loading Button",
            onClick: () => { },
            buttonVariant: "default",
            isLoading: true,
        },
        {
            text: "Active Button",
            onClick: () => { },
            buttonVariant: "default",
        },
        {
            text: "Destructive Button",
            onClick: () => { },
            buttonVariant: "destructive",
        },
        {
            cmp: <Button className="bg-yellow-500">Custom Button</Button>
        },
        {
            items: [
                {
                    text: "Bro, iam disabled",
                    onClick: () => { },
                    isDisabled: true
                },
                {
                    text: "Menu Item 2",
                    onClick: () => { }
                },
                {
                    text: "Menu Item 3",
                    onClick: () => { }
                }
            ]
        }

    ], []);

    usePageActions(pageActions)

    const dummyColumns: ColumnDef<ItemRow>[] = [
        {
            accessorKey: "item_code",
            header: (ctx) => sortHandler({
                context: ctx,
                text: "Item Code",
                align: "start"
            })
        },
        {
            accessorKey: "item_name",
            header: (ctx) => sortHandler({
                context: ctx,
                text: "Item Name",
                align: "start"
            })
        },
        {
            accessorKey: "warehouse",
            header: "Warehouse",
        },
        {
            accessorKey: "qty",
            header: "Quantity",
        },
        {
            accessorKey: "valuation_rate",
            header: "Valuation Rate",
        },
        {
            accessorKey: "quantity_difference",
            header: "Quantity Difference",
        },
        {
            accessorKey: "amount_difference",
            header: (ctx) => sortHandler({
                context: ctx,
                text: "Amount Difference",
                align: "end"
            }),
            cell(props) {
                return <div className="text-end">{props.getValue() as any}</div>
            },
        },
    ];

    const tableFilters: CustomTableFilterType[] = [
        {
            label: "ID",
            fieldName: "name",
            filterCondition: ["name", "like"],
            element: <FormInput placeholder="ID" formik={formik} name="name" />
        },
        {
            label: "From Date",
            fieldName: "from_date",
            filterCondition: ["TSI.posting_date", ">="],
            element: <FormInput type="date" formik={formik} name="from_date" />
        },
        {
            label: "To Date",
            fieldName: "to_date",
            filterCondition: ["TSI.posting_date", "<="],
            element: <FormInput type="date" formik={formik} name="to_date" />
        },
        {
            label: "Doc Status",
            fieldName: "docstatus",
            filterCondition: ["docstatus", "="],
            element: <FormDropDown placeholder="Doc Status" formik={formik} name="docstatus"
                options={[]} />
        }
    ]

    return (
        <div className="grid grid-cols-4 gap-3 items-start">
            <FormInput
                formik={formik}
                name="name"
                label="Name"
                placeholder="Enter your name"
                isRequired
            />

            <FormDropDown
                formik={formik}
                name="gender"
                label="Gender"
                options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]}
                isRequired
            />

            <FormDatePicker formik={formik} name="date" label="Date" />

            <div className="flex items-center gap-2">
                <Button size={"sm"} className="w-fit"
                    onClick={
                        () => showConfirmationDialog({
                            title: "Confirm",
                            description: "Are you sure you want to accept?",
                            size: "sm",
                            onConfirm: () => {
                                console.log("Accepted")
                            },
                            icon: <ViewHorizontalIcon />
                        })
                    }>
                    SM Alert
                </Button>

                <Button size={"sm"} className="w-fit"
                    onClick={
                        () => showConfirmationDialog({
                            title: "Confirm",
                            description: "Are you sure you want to accept?",
                            size: "default",
                            onConfirm: () => {
                                console.log("Accepted")
                            },
                            icon: <ViewHorizontalIcon />
                        })
                    }>
                    Default Alert
                </Button>

                <Button size={"sm"} className="w-fit"
                    onClick={
                        () => showConfirmationDialog({
                            title: "Confirm",
                            description: "Are you sure you want to accept?",
                            size: "default",
                            onConfirm: () => {
                                console.log("Accepted")
                            },
                        })
                    }>
                    Simple Alert
                </Button>
            </div>

            <div className="col-span-4 flex flex-wrap gap-2">
                <Badge variant={"outline"}>Outline</Badge>
                <Badge variant={"default"}>Default</Badge>
                <Badge variant={"destructive"}>Destructive</Badge>
                <Badge variant={"secondary"}>Secondary</Badge>
                <Badge variant={"ghost"}>Ghost</Badge>
                <Badge variant={"link"}>Link</Badge>
                <Badge className={BADGE_CLASSES["green"]}>Custom 1</Badge>
                <Badge className={BADGE_CLASSES["blue"]}>Custom 2</Badge>
                <Badge className={BADGE_CLASSES["red"]}>Custom 3</Badge>
                <Badge className={BADGE_CLASSES["yellow"]}>Custom 4</Badge>
                <Badge className={BADGE_CLASSES["purple"]}>Custom 5</Badge>
                <Badge className={BADGE_CLASSES["orange"]}>Custom 6</Badge>
                <Badge className={BADGE_CLASSES["pink"]}>Custom 7</Badge>
                <Badge className={BADGE_CLASSES["cyan"]}>Custom 8</Badge>
                <Badge className={BADGE_CLASSES["lime"]}>Custom 9</Badge>
                <Badge className={BADGE_CLASSES["emerald"]}>Custom 10</Badge>
                <Badge className={BADGE_CLASSES["teal"]}>Custom 11</Badge>
                <Badge className={BADGE_CLASSES["indigo"]}>Custom 12</Badge>
                <Badge className={BADGE_CLASSES["violet"]}>Custom 13</Badge>
                <Badge className={BADGE_CLASSES["fuchsia"]}>Custom 14</Badge>
                <Badge className={BADGE_CLASSES["rose"]}>Custom 15</Badge>
            </div>

            <TupleCard lineGap={10} className="col-span-2" title="Document Information" hideSeparators>
                <TupleCardLine editableConfig={editableConfigs.posting_date} title="Posting Date" value={moment().format("DD/MM/YYYY")} />
                <TupleCardLine title="Posting Time" value={moment().format("HH:mm:ss")} />
                <TupleCardLine title="Mode" value={"Manual"} />
                <TupleCardLine title="Section" value={"General"} />
            </TupleCard>

            <TupleCard lineGap={10} className="col-span-2" title="Document Information" hideSeparators>
                <TupleCardLine title="Posting Date" value={moment().format("DD/MM/YYYY")} />
                <TupleCardLine title="Posting Time" value={moment().format("HH:mm:ss")} />
                <TupleCardLine title="Mode" value={"Manual"} />
                <TupleCardLine title="Section" value={"General"} />
            </TupleCard>

            <div className="col-span-4">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        Press{" "}
                        <KbdGroup>
                            <Kbd>d</Kbd>
                        </KbdGroup>{" "}
                        to switch between dark and light mode
                    </p>
                </div>

                <Alert className="max-w-md mx-auto mt-3 bg-sky-50 dark:bg-sky-950">
                    <AlertTitle>Dark mode is now available</AlertTitle>
                    <AlertDescription>
                        Enable it under your profile settings to get started.
                    </AlertDescription>
                    <AlertAction>
                        <Button onClick={() => theme.setTheme(theme.theme === "dark" ? "light" : "dark")} size="xs" variant="default">
                            {theme.theme === "dark" ? "Enable Light" : "Enable Dark"}
                        </Button>
                    </AlertAction>
                </Alert>
            </div>

            <div className="col-span-4">
                <CustomTable
                    isLoading={false}
                    searchable={true}
                    pagination={false}
                    showColumnFilters={true}
                    columns={dummyColumns}
                    data={dummyData}
                    filterConfig={{
                        initialArgs,
                        filterFormik: formik,
                        filters: tableFilters,
                        minFilterCount: 7,
                        swrKeyPrefix: "SWRKEY",
                        setRequestData
                    }}
                />
            </div>

            <div className="col-span-4 grid grid-cols-4 gap-3">
                <Panel actions={
                    [
                        { text: "Delete", icon: <X />, onClick: () => { }, buttonVariant: "destructive", },
                        { text: "Email", icon: <Mail />, onClick: () => { }, buttonVariant: "outline", },
                        { text: "Export", icon: <SaveAllIcon />, onClick: () => { }, buttonVariant: "default", },
                    ]
                }
                    className="col-span-2" bottomPadding={false} title="Monthly Data" subTitle="Review your monthly data">
                    <CustomTable
                        isLoading={false}
                        searchable={true}
                        pagination={false}
                        showColumnFilters={true}
                        columns={dummyColumns}
                        data={dummyData}
                        columnVisibiltyProps={{
                            quantity_difference: false,
                            valuation_rate: false,
                            warehouse: false
                        }}
                        filterConfig={{
                            initialArgs,
                            filterFormik: formik,
                            automaticFilterTriggers: false,
                            filters: tableFilters,
                            minFilterCount: 1,
                            swrKeyPrefix: "SWRKEY",
                            setRequestData
                        }}
                    />
                </Panel>

                <div className="col-span-2 mb-12">
                    <HomeStats />
                </div>
            </div>

            <div className="col-span-1">
                <Panel title="This is new panel" subTitle="New panel description">
                    <DummyDataCard />
                </Panel>
            </div>
            <div className="col-span-1">
                <Panel
                    title="This is new panel"
                    subTitle="New panel description"
                >
                    <DummyDataCard />
                </Panel>
            </div>
            <div className="col-span-2">
                <Panel
                    title="This is new panel with actions"
                    subTitle="New panel description"
                    actions={
                        [
                            { text: "New 1", onClick: () => { }, buttonVariant: "default", },
                            { text: "New 2", onClick: () => { }, buttonVariant: "secondary" },
                            { text: "New 3", onClick: () => { }, buttonVariant: "destructive" },
                            { text: "New 4", onClick: () => { }, buttonVariant: "outline", isDisabled: true, isLoading: true },
                        ]
                    }>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque aspernatur cupiditate veniam, eum numquam nisi aut qui suscipit mollitia incidunt nihil cumque corporis ullam dolorem aliquam commodi cum? Quis eius distinctio quae architecto at.</p>
                </Panel>
                <Panel
                    className="mt-3"
                    title="This is new panel with new line actions"
                    subTitle="New panel description"
                    newLineActions
                    actions={
                        [
                            { text: "New 1", onClick: () => { }, buttonVariant: "default", },
                            { text: "New 2", onClick: () => { }, buttonVariant: "secondary" },
                            { text: "New 3", onClick: () => { }, buttonVariant: "destructive" },
                            { text: "New 4", onClick: () => { }, buttonVariant: "outline", isDisabled: true, isLoading: true },
                        ]
                    }>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque aspernatur cupiditate veniam, eum numquam nisi aut qui suscipit mollitia incidunt nihil cumque corporis ullam dolorem aliquam commodi cum? Quis eius distinctio quae architecto at.</p>
                </Panel>
            </div>

            <div className="col-span-4">
                <Tabs defaultValue="overview" className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="overview"> <DashboardIcon /> Overview</TabsTrigger>
                        <TabsTrigger value="analytics"><ActivityIcon /> Analytics</TabsTrigger>
                        <TabsTrigger value="reports"> <SheetIcon /> Reports</TabsTrigger>
                        <TabsTrigger value="settings"> <SettingsIcon /> Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>
                                    View your key metrics and recent project activity. Track progress
                                    across all your active projects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                You have 12 active projects and 3 pending tasks.
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="analytics">
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle>Analytics</CardTitle>
                                <CardDescription>
                                    Track performance and user engagement metrics. Monitor trends and
                                    identify growth opportunities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Page views are up 25% compared to last month.
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="reports">
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle>Reports</CardTitle>
                                <CardDescription>
                                    Generate and download your detailed reports. Export data in
                                    multiple formats for analysis.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                You have 5 reports ready and available to export.
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="settings">
                        <Card size="sm">
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>
                                    Manage your account preferences and options. Customize your
                                    experience to fit your needs.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Configure notifications, security, and themes.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    )
}

const DummyDataCard = () => {
    return (
        <Card className="relative mx-auto w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
            <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            />
            <CardHeader>
                <CardAction>
                    <Badge variant="secondary">Featured</Badge>
                </CardAction>
                <CardTitle>Design systems meetup</CardTitle>
                <CardDescription>
                    A practical talk on component APIs, accessibility, and shipping
                    faster.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full">View Event</Button>
            </CardFooter>
        </Card>

    )
}