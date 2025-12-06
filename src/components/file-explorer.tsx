import { CopyCheckIcon, CopyIcon, ChevronLeftIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment, useEffect } from "react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { CodeView } from "./code-view";
import { useIsMobile } from "@/hooks/use-mobile";

import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle
} from "@/components/ui/resizable"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis
} from '@/components/ui/breadcrumb'
import { convertFilesToTree } from "@/lib/utils";
import { TreeView } from "./tree-view";

type FileCollection = { [path: string]: string };

function getLanguageFromExtention(filename: string): string {
    const extension = filename.split('.').pop()?.toLocaleLowerCase();
    return extension || 'text';
}

interface FileBreadcrumbsProps {
    filepath: string;
}

const FileBreadCrumb = ({ filepath }: FileBreadcrumbsProps) => {
    const pathSegments = filepath.split("/");
    const maxSegments = 4;


    const renderBreadCrumbItems = () => {
        if (pathSegments.length <= maxSegments) {
            return pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;

                return (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage>
                            ) : (
                                <span className="text-muted-foreground">{segment}</span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}

                    </Fragment>
                )
            })
        } else {
            const firstSegment = pathSegments[0];
            const lastSegement = pathSegments[pathSegments.length - 1];

            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-muted-foreground">
                            {firstSegment}
                        </span>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>

                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium">
                                {lastSegement}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbItem>
                </>
            )
        }
    }
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {renderBreadCrumbItems()}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

interface FileExplorerProps {
    files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
    const [copied, setCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });
    const isMobile = useIsMobile();
    const [mobileView, setMobileView] = useState<"tree" | "code">("tree");

    useEffect(() => {
        if (!isMobile) {
            setMobileView("tree");
        }
    }, [isMobile]);

    const treeData = useMemo(() => {
        return convertFilesToTree(files);
    }, [files]);

    const handleFileSelect = useCallback((filepath: string) => {
        if (files[filepath]) {
            setSelectedFile(filepath);
            if (isMobile) {
                setMobileView("code");
            }
        }
    }, [files, isMobile]);
    const handleCopy = () => {
        if (selectedFile) {
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }
    if (isMobile) {
        if (mobileView === "tree") {
            return (
                <div className="h-full w-full bg-sidebar">
                    <TreeView
                        data={treeData}
                        value={selectedFile}
                        onSelect={handleFileSelect}
                    />
                </div>
            )
        } else {
            return (
                <div className="h-full w-full flex flex-col ">
                    <div className="border-b bg-sidebar px-4 py-2 flex items-center gap-x-2">
                        <Button size="icon" variant="ghost" onClick={() => setMobileView("tree")}>
                            <ChevronLeftIcon />
                        </Button>
                        {selectedFile && <FileBreadCrumb filepath={selectedFile} />}
                        <Hint text="copy to clipboard" side="bottom" align="start">
                            <Button variant="outline"
                                size="icon" className="ml-auto "
                                onClick={handleCopy}
                                disabled={copied}
                            >
                                {copied ? <CopyCheckIcon /> : <CopyIcon />}
                            </Button>
                        </Hint>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {selectedFile && files[selectedFile] ? (
                            <CodeView code={files[selectedFile]} lang={getLanguageFromExtention(selectedFile)} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Select a file to view it&apos;s code
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    }

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
                defaultSize={30}
                minSize={30}
                className="bg-sidebar"
            >
                <TreeView
                    data={treeData}
                    value={selectedFile}
                    onSelect={handleFileSelect}
                />
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel defaultSize={70} minSize={50}>
                {selectedFile && files[selectedFile] ? (

                    <div className="h-full w-full flex flex-col ">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">

                            <FileBreadCrumb filepath={selectedFile} />
                            <Hint text="copy to clipboard" side="bottom" align="start">
                                <Button variant="outline"
                                    size="icon" className="ml-auto "
                                    onClick={handleCopy}
                                    disabled={copied}
                                >
                                    {copied ? <CopyCheckIcon /> : <CopyIcon />}
                                </Button>
                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView code={files[selectedFile]} lang={getLanguageFromExtention(selectedFile)} />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a file to view it&apos;s code
                    </div>
                )}
            </ResizablePanel>

        </ResizablePanelGroup>
    )
}
