import _ from "lodash";
import { useState } from "react";

export interface IUseObjectChange {
    isChanged: boolean,
    setInitialObj: Function
}

/**
* useObjChange hook identifies object changes. If the initial object is different from current object, is returns isChanged as true
*
* @param model - Current object
* @returns isChanged: Bool, setInitialObj: Function
*/
export const useObjChange = (model: any): IUseObjectChange => {
    const [initialObj, setInitialObj] = useState<any>({});

    return {
        isChanged: !_.isEqual(model, initialObj),
        setInitialObj
    }
}

(useObjChange as any).displayName = "useObjChange";
(useObjChange as any).version = "1.0.0";