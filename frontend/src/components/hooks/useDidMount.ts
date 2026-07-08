import {useEffect, useRef} from "react";

interface IProps {
    mountMethod: Function,
    params?: any
}

const useDidMount = ({mountMethod, params}: IProps) => {
    const isMount = useRef<boolean>(false)

    useEffect(() => {
        if (!isMount.current) {
            mountMethod(params && {...params})
            isMount.current = true
        }
    }, []);
}

export default useDidMount