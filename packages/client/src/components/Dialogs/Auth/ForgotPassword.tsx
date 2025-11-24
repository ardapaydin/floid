import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { requestResetPasswordToken } from "@/utils/api/auth";
import { Check } from "lucide-react";
import { useState } from "react";

export function ForgotPassword({ children }: { children: React.ReactNode }) {
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const reset = async () => {
        const r = await requestResetPasswordToken(email);
        if (r.status == 200) setSent(true);
        else setErrors(r.data?.errors || {})
    }


    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogTitle className="font-medium text-lg">
                    Forgot Password
                </DialogTitle>

                {!sent && (
                    <div className="flex flex-col">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-white/90">Email</label>
                            {errors?.email && <p className="text-red-400">{errors.email[0]}</p>}

                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="my@email.com"
                                className="px-4 py-3 rounded-lg bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition"
                            />
                        </div>

                        <div className="flex justify-end border-t mt-4 border-[#444]">
                            <button
                                onClick={() => reset()}
                                disabled={!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email)}
                                className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                Request Reset Link
                            </button>
                        </div>

                    </div>
                ) || (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Check className="h-10 w-10 text-green-500" />

                            <h1 className="font-bold">Password Reset Link Sent</h1>
                            <p className="text-sm text-center text-white/80">
                                We've sent a password reset link to <span className="font-medium text-white">{email}</span>.
                                Please check your inbox and follow the instructions to reset your password.
                            </p>
                        </div>
                    )}
            </DialogContent>
        </Dialog>
    )
}