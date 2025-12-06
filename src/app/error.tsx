"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background p-4 text-center">
            <div className="animate-bounce text-9xl">😵</div>
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Oops! Something went wrong.
                </h1>
                <p className="text-muted-foreground text-lg">
                    Don&apos;t worry, even the best code trips sometimes.
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => reset()} size="lg" variant="default">
                    Try Again 🔄
                </Button>
                <Button onClick={() => window.location.href = "/"} size="lg" variant="outline">
                    Go Home 🏠
                </Button>
            </div>
        </div>
    );
}
