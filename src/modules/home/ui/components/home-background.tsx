"use client"

import { useEffect, useState } from "react";

export const HomeBackground = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:16px_16px]" />
        );
    }

    return (
        <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
            <ShiningDots />
        </div>
    );
};

const ShiningDots = () => {
    const [dots, setDots] = useState<{ id: number; top: string; left: string; delay: string; duration: string }[]>([]);

    useEffect(() => {
        const initialDots = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 5}s`,
            duration: `${3 + Math.random() * 5}s`
        }));
        setDots(initialDots);
    }, []);

    const handleAnimationIteration = (id: number) => {
        setDots(prevDots => prevDots.map(dot => {
            if (dot.id === id) {
                return {
                    ...dot,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                };
            }
            return dot;
        }));
    };

    return (
        <>
            <style jsx global>{`
                @keyframes shine {
                    0% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1.5); }
                    100% { opacity: 0; transform: scale(0); }
                }
                .animate-shine {
                    animation: shine linear infinite;
                }
            `}</style>
            {dots.map((dot) => (
                <div
                    key={dot.id}
                    className="absolute w-[3px] h-[3px] bg-primary rounded-full animate-shine"
                    style={{
                        top: dot.top,
                        left: dot.left,
                        animationDelay: dot.delay,
                        animationDuration: dot.duration,
                        boxShadow: '0 0 4px 1px var(--primary)'
                    }}
                    onAnimationIteration={() => handleAnimationIteration(dot.id)}
                />
            ))}
        </>
    );
};
