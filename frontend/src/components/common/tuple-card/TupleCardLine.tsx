import FormSelect from "@/components/common/form-components/FormSelect";
import type { FormikX } from "@/components/hooks/useFormikX";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { BADGE_CLASSES } from "@/lib/general_utils";
import clsx from 'clsx';
import { useFormik } from 'formik';
import { type SWRConfiguration } from 'frappe-react-hooks';
import _, { get, isArray, isEmpty } from 'lodash';
import { ArrowRightCircle, Edit2, Edit2Icon, Edit3, EditIcon, Settings } from 'lucide-react';
import React, { type JSX, type ReactElement, useEffect, useRef, useState } from 'react';
import FormDatePicker from '../form-components/FormDatePicker';
import FormDropDown from '../form-components/FormDropDown';
import FormInput from '../form-components/FormInput';
import FormSearchableDropdown from '../form-components/FormSearchableDropdown';
import FormTextArea from '../form-components/FormTextArea';
import { type DropdownOption, type SelectOption } from '../form-components/types/forms.types';
import type { BadgeColorType } from "../types/common.type";
import './tuplecard-styles.css';


interface TupleCardLineGeneralType {
    title: string;
    value: ReactElement | string;
    type?: 'text';
    editableConfig?: EditableTupleCardLineType;
    isLoading?: boolean
    label?: string | number | null | undefined;
    valuePosition?: 'start' | 'end' | 'center';
    suffixRender?: ReactElement | null;
    prifixRender?: ReactElement | null;
    pref?: ReactElement | null;
    valueClassName?: string;
    valueParser?: (value: any) => any,
    hideLabel?: boolean

}

interface TupleCardLineBadgeType {
    title: string;
    value: string;
    type: 'badge';
    colorSchema: BadgeColorType;
    editableConfig?: EditableTupleCardLineType;
    isLoading?: boolean
    label?: string | number | null | undefined;
    valuePosition?: 'start' | 'end' | 'center';
    suffixRender?: ReactElement | null;
    prifixRender?: ReactElement | null;
    valueClassName?: string;
    hideLabel?: boolean
}

interface TupleCardLineLinkType {
    title: string;
    value: string;
    type: 'link';
    onLinkClick: () => void;
    editableConfig?: EditableTupleCardLineType;
    isLoading?: boolean
    label?: string | number | null | undefined;
    valuePosition?: 'start' | 'end' | 'center';
    suffixRender?: ReactElement | null;
    prifixRender?: ReactElement | null;
    valueClassName?: string;
    hideLabel?: boolean
}

export interface EditableTupleCardLineTextProps {
    editable?: boolean;
    helpText?: string;
    formikX: FormikX;
    name: string,
    dependsOn?: string[];
    type: 'input' | 'textarea';
    inputType: 'text' | 'number' | 'email' | 'date' | 'time' | 'password' | 'tel' | 'url' | 'datetime-local';
    onSave?: () => any
}

export interface EditableTupleCardLineTimeEstimationProps {
    editable?: boolean;
    helpText?: string;
    formikX: FormikX;
    type: 'time-estimation';
    name: string,
    dependsOn?: string[];
    onSave?: () => any
}

export interface EditableTupleCardLineDateProps {
    editable?: boolean;
    helpText?: string;
    formikX: FormikX;
    name: string,
    type: 'date';
    dateFormat?: string;
    dependsOn?: string[];
    onSave?: () => any
}

export interface EditableTupleCardLineDropdownProps {
    editable?: boolean;
    helpText?: string;
    formikX: FormikX;
    name: string,
    type: 'dropdown';
    resolvedValueKeyName?: string;
    options?: DropdownOption[];
    dependsOn?: string[];
    onSave?: () => any
    onNewItemSelected?: () => void
    newItemText?: string
    swrConfig?: SWRConfiguration;
    swrKey?: string;
    method?: string;
    methodBody?: Record<string, any>,
    itemRenderer?: (item: any) => JSX.Element
}

export interface EditableTupleCardLineSelectProps {
    editable?: boolean;
    helpText?: string;
    formikX: FormikX;
    name: string,
    type: 'select';
    isMulti: boolean;
    resolvedValueKeyName?: string;
    options: SelectOption[];
    dependsOn?: string[];
    onSave?: () => any,
    itemRenderer?: (item: any) => JSX.Element
}

export interface EditableTupleCardLineSearchableSelectProps {
    editable?: boolean;
    helpText?: string;
    formikX: FormikX;
    name: string,
    resolvedValueKeyName?: string;
    type: 'searchable';
    swrConfig?: SWRConfiguration;
    swrKey?: string;
    method?: string;
    dependsOn?: string[];
    methodBody?: Record<string, any>
    onSave?: () => any
    onNewItemSelected?: () => void
    newItemText?: string,
    itemRenderer?: (item: any) => JSX.Element
}

type TupleCardLineType = TupleCardLineGeneralType | TupleCardLineBadgeType | TupleCardLineLinkType;
type EditableTupleCardLineType =
    EditableTupleCardLineTextProps
    | EditableTupleCardLineDateProps
    | EditableTupleCardLineDropdownProps
    | EditableTupleCardLineSearchableSelectProps
    | EditableTupleCardLineSelectProps

function TupleCardLine(props: TupleCardLineType) {
    const { title, type = 'text', value, editableConfig, isLoading, label, valuePosition = "start", hideLabel = false } = props;
    const [error, setError] = useState<string>('');

    const isDepending = (props?.editableConfig && 'dependsOn' in props.editableConfig);

    const valueRender = () => {
        if (isLoading) return <Skeleton className='h-3.5 w-32' />

        const renderingValue = label ? label : value;

        if (renderingValue == 'N/A') {
            return <p className={clsx("text-sm text-black dark:text-white", props?.valueClassName && props.valueClassName)}>{renderingValue}</p>;
        }

        if (type === 'badge' && 'colorSchema' in props) {
            return (
                <Badge className={clsx('text-[12px] py-0! -translate-y-[0.4px] shadow-none', BADGE_CLASSES[props.colorSchema], props?.valueClassName && props.valueClassName)}>
                    {renderingValue}
                </Badge>
            );
        }

        if (type === 'link' && 'onLinkClick' in props) {
            return (
                <div onClick={props.onLinkClick}
                    className={clsx("flex items-center gap-1 hover:text-orange-500 transition-colors cursor-pointer", props?.valueClassName && props.valueClassName)}>
                    <ArrowRightCircle className="h-4 w-4 text-orange-500" />
                    {renderingValue}
                </div>
            );
        }

        if (type === 'text') {
            return (
                <p className={clsx("text-sm text-black dark:text-white", props?.valueClassName && props.valueClassName)}>
                    {("valueParser" in props && props?.valueParser) ? props.valueParser(renderingValue) : renderingValue}
                </p>
            )
        }

        return (
            <p className={clsx("text-sm text-black dark:text-white", props?.valueClassName && props.valueClassName)}>
                {renderingValue}
            </p>
        );
    }

    return (
        <div className={clsx('flex w-full bg-opacity-animation', Boolean(error && !isLoading) ? 'bg-red-100' : 'bg-white dark:bg-transparent')}>
            {!hideLabel && (
                <div className='flex-initial w-52'>
                    <p className={clsx("text-black dark:text-white text-sm", (error && isDepending && !isLoading) && 'text-red-500')}>{title}</p>
                </div>
            )}

            <div className={clsx(
                "flex w-60 items-center gap-3",
                (valuePosition == "end") && "w-full! justify-end",
                (valuePosition == "center") && "w-full! justify-center"
            )}>
                <div className='text-sm flex items-center'>
                    {props?.prifixRender ? props.prifixRender : null}
                    {(error && isDepending && !isLoading) ? <span className='text-red-500'>{error}</span> : <span>
                        {valueRender()} {(value == 'N/A' || value == null || value == '') ? <span className="text-red-500">{error}</span> : null}</span>}
                    {props?.suffixRender ? props.suffixRender : null}
                </div>

                {!isLoading && <TupleValueEditor setError={setError} config={editableConfig} title={title} />}
            </div>
        </div>
    );
}

TupleCardLine.displayName = 'TupleCardLine';
(TupleCardLine as any).version = "1.1.0";

export default TupleCardLine;

interface TupleValueEditorProps {
    config?: EditableTupleCardLineType;
    title?: string
    setError?: any
}

const TupleValueEditor = ({ config, title, setError }: TupleValueEditorProps) => {
    if (config?.editable === false || _.isEmpty(config)) return null;

    const { name, formikX, type } = config;
    const [show, setShow] = React.useState<boolean>(false);
    const textAreaRef = useRef<any>(null);

    const shallowFormik = useFormik(formikX.config);
    const error = get(shallowFormik, ["errors", name], "");

    if ("dependsOn" in config && !isEmpty(config.dependsOn) && isArray(config.dependsOn)) {
        let isChanged = false;

        for (let i = 0; i < config.dependsOn.length; i++) {
            if (get(formikX.formik.values, "_field_change_log", {})[config.dependsOn[i]] === "Yes") {
                isChanged = true;
                break;
            }
        }

        if (isChanged && get(formikX, ["formik", "values", name], "No") != "") {
            formikX.formik.setFieldValue(name, "")

            let fields: any = {}
            config.dependsOn.forEach((dep) => {
                fields[dep] = "No"
            })

            formikX.formik.setFieldValue("_field_change_log", {
                ...formikX.formik.values["_field_change_log"],
                ...fields
            })
        }
    }

    useEffect(() => {
        try {
            if (setError) {
                setError(error)
                if (error) {
                    shallowFormik.submitForm();
                }
            }
        } catch (error) {
            console.log("TupleCardLine Error =>", error)
        }
    }, [error])

    useEffect(() => {
        shallowFormik.setValues(formikX.formik.values)
    }, [JSON.stringify(formikX.formik)])

    const onFocusHandler = () => {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(textAreaRef.current.value.length, textAreaRef.current.value.length)
    }

    const editableFieldGenerator = () => {
        if (type === 'textarea') {
            return <FormTextArea className="h-28" ref={textAreaRef} onFocus={onFocusHandler} name={name} label={title}
                formik={shallowFormik} />
        }

        if (type === 'date') {
            return <FormDatePicker name={name} dateFormat={config?.dateFormat} label={title} formik={shallowFormik} />
        }

        if (type === 'dropdown') {
            return <FormDropDown onNewItemSelected={config.onNewItemSelected} newItemText={config.newItemText} name={name} label={title} formik={shallowFormik} options={config.options} swrKey={config?.swrKey || config.method} swrConfig={config.swrConfig} method={config.method} methodBody={config.methodBody} itemRenderer={config.itemRenderer} />
        }

        if (type === 'select') {
            return <FormSelect formik={shallowFormik} name={name} options={config.options} isMulti={config.isMulti ?? false} itemRenderer={config.itemRenderer} />
        }

        if (type === 'searchable') {
            return <FormSearchableDropdown label={title} onNewItemSelected={config.onNewItemSelected} newItemText={config.newItemText} swrKey={config?.swrKey || config.method} formik={shallowFormik} swrConfig={config.swrConfig} method={config.method} methodBody={config.methodBody} name={name} itemRenderer={config?.itemRenderer} />
        }

        return <FormInput type={config?.inputType ? config.inputType : 'text'} autoFocus={true} name={name} label={title} formik={shallowFormik} />
    }

    const onSave = () => {
        if (!error) {
            formikX.formik.setFieldValue(name, shallowFormik.values[name])

            if (`${name}_meta` in shallowFormik.values) {
                formikX.formik.setFieldValue(`${name}_meta`, shallowFormik.values[`${name}_meta`])
            }

            if ("resolvedValueKeyName" in config && config?.resolvedValueKeyName) {
                config.formikX.formik.setFieldValue(config.resolvedValueKeyName, get(shallowFormik, ['values', `${name}_meta`, "label"]))
            }

            setShow(false)

            formikX.formik.setFieldValue("_field_change_log", {
                ...formikX.formik.values["_field_change_log"],
                [name]: "Yes"
            })

            if (config?.onSave) {
                config.onSave()
            }
        } else {
            shallowFormik.validateForm();
        }
    }

    return (
        <Popover open={show} onOpenChange={setShow}>
            <PopoverTrigger asChild>
                <Edit3 className='text-gray-400 min-w-3 h-3 cursor-pointer transition-all hover:text-gray-800' />
            </PopoverTrigger>
            <PopoverContent side='bottom' align="center" className="w-80 p-3 anim-opacity">
                <PopoverHeader>
                    <PopoverTitle>Edit {title}</PopoverTitle>
                    {config?.helpText && <PopoverDescription>{config?.helpText}</PopoverDescription>}
                </PopoverHeader>

                {editableFieldGenerator()}

                <div className='w-full flex justify-end mt-3'>
                    <div className='flex items-center gap-2'>
                        <Button className='h-7' onClick={() => setShow(false)} variant={"destructive"}
                            size={"sm"}>Cancel</Button>
                        <Button onClick={onSave} className='h-7' variant={"default"}
                            size={"sm"}>Save</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}