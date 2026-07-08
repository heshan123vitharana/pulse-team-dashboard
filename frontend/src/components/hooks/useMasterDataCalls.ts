import { useFrappeGetCall, useFrappePostCall, keyInvalidator } from "frappe-react-hooks";
import { USE_MOCK_DATA, useMockGetCall, useMockPostCall, triggerMockInvalidation } from "./useMasterData";

export const useMasterDataGet = (method: string, args: any, key: any) => {
    const realCall = useFrappeGetCall(method, args, key);
    const mockCall = useMockGetCall(method, args);
    return USE_MOCK_DATA ? mockCall : realCall;
};

export const useMasterDataPost = (method: string) => {
    const realCall = useFrappePostCall(method);
    const mockCall = useMockPostCall(method);
    return USE_MOCK_DATA ? mockCall : realCall;
};

export const masterDataKeyInvalidator = (tags: string[]) => {
    if (USE_MOCK_DATA) {
        triggerMockInvalidation();
    } else {
        keyInvalidator(tags);
    }
};
