import Navbar from "./navbar"
import { Sidebar } from "./sidebar"

export default function Layout({ children, contents = ["navbar", "sidebar"] }: {
    children: React.ReactNode,
    contents?: ("navbar" | "sidebar")[]
}) {
    return (
        <div className="flex flex-col h-screen">
            {contents.includes("navbar") && <Navbar />}

            <div className="flex flex-1 h-screen">
                {contents.includes("sidebar") && <Sidebar />}

                <div className="flex flex-col overflow-auto flex-1 min-h-0">
                    <div className="p-4 w-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}