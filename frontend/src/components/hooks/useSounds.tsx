import { useRef, useEffect } from "react";

export const useSounds = (audioSource: any) => {
    const soundRef: any = useRef<any>(null);

    useEffect(() => {
        soundRef.current = new Audio(audioSource);
    }, []);

    const playSound = () => {
        soundRef.current.play();
    };

    const pauseSound = () => {
        soundRef.current.pause();
    };

    return {
        playSound,
        pauseSound,
    };
};
