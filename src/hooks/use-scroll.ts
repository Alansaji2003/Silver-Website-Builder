import { useState, useEffect } from "react";

export const useScroll = (threshold = 10) => {
    const [isscrolled, setIsscrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsscrolled(window.scrollY > threshold);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [threshold]);
    return isscrolled;
}