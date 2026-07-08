import { get, isEmpty } from "lodash"

export const useTupleCardDirtyDetector = (formik: any): boolean => {
    return !isEmpty(get(formik, "values._field_change_log", {}))
}

useTupleCardDirtyDetector.displayName = "useTupleCardDirtyDetector";
(useTupleCardDirtyDetector as any).version = "1.0.2";