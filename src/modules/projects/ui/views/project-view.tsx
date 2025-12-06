"use client";


import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, CodeIcon, CrownIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
    projectId: string;
};
export const ProjectView = ({ projectId }: Props) => {
    const { has } = useAuth();
    const hasPremiumAccess = has?.({ plan: "pro" })
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<"preview" | "code">("preview");
    const isMobile = useIsMobile();
    const [mobileView, setMobileView] = useState<"chat" | "code">("chat");
    const [hasNewResponse, setHasNewResponse] = useState(false);

    // Use ref to track mobileView for the callback
    const mobileViewRef = useRef(mobileView);
    useEffect(() => {
        mobileViewRef.current = mobileView;
    }, [mobileView]);

    if (isMobile) {
        return (
            <div className="h-screen flex flex-col relative pt-10">
                {mobileView === "chat" ? (
                    <div className="flex flex-col h-full">
                        <ErrorBoundary fallback={<div>Failed to load project details</div>}>
                            <Suspense fallback={<div>Loading Project...</div>}>
                                <ProjectHeader projectId={projectId} />
                            </Suspense>
                        </ErrorBoundary>
                        <ErrorBoundary fallback={<div>Failed to load messages</div>}>
                            <Suspense fallback={<div>Loading Messages...</div>}>
                                <MessagesContainer projectId={projectId}
                                    activeFragment={activeFragment}
                                    setActiveFragment={setActiveFragment}
                                    onMessageReceived={() => {
                                        if (mobileViewRef.current === "code") {
                                            setHasNewResponse(true);
                                        }
                                    }}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <Tabs className="h-full gap-y-0"
                            defaultValue="preview"
                            value={tabState}
                            onValueChange={(value) => setTabState(value as "preview" | "code")}
                        >
                            <div className="w-full flex items-center p-2 border-b gap-x-2">
                                <TabsList className="h-8 p-0 border rounded-md">

                                    <TabsTrigger value="preview" className="rounded-md">
                                        <EyeIcon /> <span>Demo</span>
                                    </TabsTrigger>

                                    <TabsTrigger value="code"> <CodeIcon /><span>Code</span></TabsTrigger>
                                </TabsList>
                                <div className="ml-auto flex items-center gap-x-2">
                                    {!hasPremiumAccess && (
                                        <Button asChild size="sm" variant="tertiary">
                                            <Link
                                                href="/pricing"
                                            >

                                                <CrownIcon />Upgrade

                                            </Link>
                                        </Button>
                                    )}
                                    <UserControl />
                                </div>

                            </div>
                            <TabsContent value="preview">
                                {!!activeFragment && <FragmentWeb data={activeFragment} />}
                            </TabsContent>
                            <TabsContent value="code" className="min-h-0">
                                {!!activeFragment?.files && (
                                    <FileExplorer files={activeFragment.files as { [path: string]: string }} />
                                )}
                            </TabsContent>

                        </Tabs>
                    </div>
                )}
                <Button
                    className={`fixed bottom-24 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg ${hasNewResponse ? "bg-blue-500 animate-pulse" : ""}`}
                    onClick={() => {
                        setMobileView(v => v === "chat" ? "code" : "chat");
                        setHasNewResponse(false);
                    }}
                >
                    {mobileView === "chat" ? <CodeIcon /> : <MessageSquareIcon />}
                </Button>
            </div>
        )
    }

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0">
                    <ErrorBoundary fallback={<div>Failed to load project details</div>}>
                        <Suspense fallback={<div>Loading Project...</div>}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<div>Failed to load messages</div>}>
                        <Suspense fallback={<div>Loading Messages...</div>}>
                            <MessagesContainer projectId={projectId}
                                activeFragment={activeFragment}
                                setActiveFragment={setActiveFragment}
                            />
                        </Suspense>
                    </ErrorBoundary>

                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                >
                    <Tabs className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as "preview" | "code")}
                    >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">

                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>

                                <TabsTrigger value="code"> <CodeIcon /><span>Code</span></TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasPremiumAccess && (
                                    <Button asChild size="sm" variant="tertiary">
                                        <Link
                                            href="/pricing"
                                        >

                                            <CrownIcon />Upgrade

                                        </Link>
                                    </Button>
                                )}
                                <UserControl />
                            </div>

                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer files={activeFragment.files as { [path: string]: string }} />
                            )}
                        </TabsContent>

                    </Tabs>

                </ResizablePanel>

            </ResizablePanelGroup >

        </div >
    )
}