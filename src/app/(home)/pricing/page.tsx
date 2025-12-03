"use client";

import Image from "next/image";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";

const Page = () => {
    const theme = useCurrentTheme();
    return (
        <div className="flex flex-col max-w-3xl mx-auto w-full">
            <section className="space-y-6 pt-[16vh] 2xl:pt-48">
                <div className="flex flex-col items-center">
                    <Image
                        src="/Silverlogo.png"
                        alt="Silver"
                        width={50}
                        height={50}
                        className="hidden md:block"
                    />

                </div>
                <h1 className="text-xl md:text-3xl font-bold text-center">Pricing</h1>
                <p className="text-center text-muted-foreground text-sm md:text-base">
                    choose a plan that works for you
                </p>
                <PricingTable
                    appearance={{
                        baseTheme: theme === "dark" ? dark : undefined,
                        elements: {
                            pricingTableCard: "border! shadow-none! rounded-lg!"
                        }
                    }}
                />
            </section>

        </div>

    )
}

export default Page