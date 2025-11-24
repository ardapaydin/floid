import Layout from "@/components/Layout/layout";
import { Sandwich } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotFound() {
    const nav = useNavigate();
    return (
        <Layout>
            <div className="items-center h-full flex flex-col justify-center">
                <Sandwich className="w-32 h-32" />
                <h1 className="font-medium text-xl">Page not found :|</h1>
                <button
                    onClick={() => nav("/")}
                    className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                    Explore
                </button>
            </div>
        </Layout>
    )
}