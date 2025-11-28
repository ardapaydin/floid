import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { useTwoFactorDialogStore } from "@/store/twoFactorDialogStore";
import { finishMFA } from "@/utils/api/twoFa";
import axios from "axios";
import { Key } from "lucide-react";
import { useState } from "react";

export function MFADialog({ children }: { children: React.ReactNode }) {
    const { isOpen, setIsOpen, data } = useTwoFactorDialogStore();

    const [code, setCode] = useState<string>("")
    const [selectedType, setSelectedType] = useState<("totp" | "backup")>("totp");
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const submit = async () => {
        const r = await finishMFA(selectedType, code, data.mfa!.ticket);
        if (r.status == 200) {
            axios.defaults.headers["x-mfa-authorization"] = r.data.data.token;
            if (data.function) data.function()
            setIsOpen(false);
        } else setErrors(r?.data?.errors || { code: ["Server error."] })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="px-0">
                <DialogHeader>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Key size={60} />
                        <h1 className="text-2xl font-medium">Multiple Factor Authenication</h1>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-1 px-12">
                    {errors?.code && <p className="text-red-400">{errors?.code[0]}</p>}
                    <div className="flex gap-4 justify-center">
                        {selectedType == "totp" && Array.from({ length: 6 }, (_, i) => (
                            <input
                                inputMode="numeric"
                                id={`input-code-${i}`}
                                pattern="[0-9]"
                                autoComplete={!i ? "one-time-code" : undefined}
                                onChange={(e) => {
                                    setErrors({});

                                    const val = e.target.value;
                                    const allInputs = e.target.closest('.flex')?.querySelectorAll("input");
                                    if (val.match(/^[0-9]$/) && allInputs) {
                                        if (i < 5) allInputs[i + 1].focus();
                                        setCode([...allInputs].map((i) => i.value).join(''))
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key !== "Backspace") return;
                                    e.preventDefault();
                                    const allInputs = (e.target as HTMLInputElement).closest(".flex")?.querySelectorAll("input");

                                    if (allInputs) {
                                        (e.target as HTMLInputElement).value = "";
                                        if (i > 0) allInputs[i - 1].focus();
                                        setCode([...allInputs].map((i) => i.value).join(''))
                                    }
                                }}
                                key={i}
                                maxLength={1}
                                className="w-12 h-12 border rounded-lg focus:outline-none text-center bg-[#292828] border-[#505050]"
                            />
                        ))}

                        {selectedType == "backup" && (
                            <input
                                type="text"
                                placeholder="xxxx-xxxx-xxxx"
                                className="h-12 w-full border rounded-lg focus:outline-none text-center bg-[#292828] border-[#505050]"
                                autoComplete="one-time-code"
                                maxLength={14}
                                onChange={(e) => {
                                    setErrors({});
                                    const val = e.target.value.replace(/[^0-9a-zA-Z]/g, "").match(/.{1,4}/g)?.join('-') || "";
                                    e.target.value = val;
                                    setCode(val)
                                }}
                            />
                        )}
                    </div>

                    <div className="mt-4 gap-4 flex flex-col">
                        {(data.mfa?.options || []).length > 1 && (
                            <div className="flex">
                                <p className="text-sm text-green-500 font-semibold cursor-pointer" onClick={() => setSelectedType((old) => old == "totp" ? "backup" : "totp")}>{selectedType != "totp" ? "Use the authenicator app" : "Use backup code"}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => submit()}
                            disabled={
                                (selectedType == "totp" && code.length != 6) ||
                                (selectedType == "backup" && code.length != 14)
                            }
                            className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}