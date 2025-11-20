import { cn } from "@/lib/utils";
import { useState } from "react"
import Overview from "./Overview";
import Comments from "./Comments";

export default function MainSections() {
    const [section, setSection] = useState("overview");
    return (
        <div className="flex flex-col">
            <div className="flex mt-6 gap-2">
                <div
                    onClick={() => setSection("overview")}
                    className={cn("hover:bg-[#444]/70 transition-all text-gray-200 font-semibold px-5 py-2 cursor-pointer rounded-full border-[#444]", section == "overview" ? "bg-[#444]/50" : "border")}>
                    Overview
                </div>
                <div
                    onClick={() => setSection("comments")}
                    className={cn("hover:bg-[#444]/70 transition-all text-gray-200 font-semibold px-5 py-2 cursor-pointer rounded-full border-[#444]", section == "comments" ? "bg-[#444]/50" : "border")}>
                    Comments
                </div>
            </div>

            {section == "overview" && <Overview />}
            {section == "comments" && <Comments />}
        </div>
    )
}