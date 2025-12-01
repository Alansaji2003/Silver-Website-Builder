import { HomeBackground } from "@/modules/home/ui/components/home-background";

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        <main className="flex flex-col h-full overflow-hidden">
            <HomeBackground />
            <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto overflow-x-hidden">

                {children}
            </div>
        </main>

    )
}

export default Layout;
