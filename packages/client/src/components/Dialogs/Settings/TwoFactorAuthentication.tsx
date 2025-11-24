import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTwoFactor } from "@/utils/api/twoFa";
import { Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function TwoFactorAuthentication({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState("")
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const twoFa = useTwoFactor(isOpen);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Enable Two Factor Authentication</DialogTitle>
                {twoFa.isLoading && <Loading />}
                {twoFa.data && (
                    <div className="flex flex-col gap-4 w-full">
                        <div className="items-center flex justify-center">
                            <img src={twoFa.data.data.qrUrl} className="w-52 h-52 rounded-2xl bg-white p-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="font-medium text-white/70">Secret</h1>
                            <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                                <input
                                    value={twoFa.data.data.secret}
                                    max={255}
                                    readOnly
                                    className="px-4 py-3 rounded-lg rounded-r-none w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                                />

                                <div
                                    onClick={() => {
                                        navigator.clipboard.writeText(twoFa.data.data.secret)
                                        toast.success("Secret copied to clipboard")
                                    }}
                                    className="px-3 py-3 rounded-lg rounded-l-none cursor-pointer hover:bg-[#333333] transition bg-[#313131] border-b-3 border-[#242323] text-white">
                                    <Copy />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="font-medium text-white/70">Enter code</h1>
                            {errors.code && <p className="text-red-400">{errors.code[0]}</p>}
                            <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    onKeyDown={(e) => {
                                        if (e.key == "Backspace") return;
                                        if (!/[0-9]/.test(e.key)) e.preventDefault()
                                        else setErrors({})
                                    }}
                                    placeholder="000000"
                                    className="px-4 py-3 rounded-lg font-bold w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-[#444]">
                            <button
                                disabled={code.length != 6}
                                className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}