import Navbar from "./navbar"
import { Sidebar } from "./sidebar"

export default function Layout({ children, contents = ["navbar", "sidebar"] }: {
    children: React.ReactNode,
    contents?: ("navbar" | "sidebar")[]
}) {
    return (
        <div className="flex flex-col h-screen">
            {contents.includes("navbar") && <Navbar />}

            <div className="flex flex-1 min-h-0">
                {contents.includes("sidebar") && <Sidebar />}

                <div className="flex flex-col flex-1 overflow-auto">
                    <div className="p-4 py-4 mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}