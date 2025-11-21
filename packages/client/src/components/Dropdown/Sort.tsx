import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function SortPosts({ children, sort, setSort }: { children: React.ReactNode, sort: string, setSort: React.Dispatch<React.SetStateAction<"best" | "new">> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent className="border-0 w-64 bg-[#222121] mr-2">
                <h1 className="text-white font-bold text-sm mb-2 ml-1 mt-2">Sort by</h1>
                <hr className="border-black" />
                <DropdownMenuItem
                    onClick={() => setSort("best")}
                    className={cn("text-white focus:bg-[#333]/50 py-2 focus:text-white transition cursor-pointer", sort == "best" ? "bg-[#333]/30" : "")}>
                    Best
                </DropdownMenuItem>                <DropdownMenuItem
                    onClick={() => setSort("new")}
                    className={cn("text-white focus:bg-[#333]/50 py-2 focus:text-white transition cursor-pointer", sort == "new" ? "bg-[#333]/30" : "")}>
                    New
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}