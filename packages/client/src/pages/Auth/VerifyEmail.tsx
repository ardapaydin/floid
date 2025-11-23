import Loading from "@/components/Loading/Loading";
import { useVerifyEmail } from "@/utils/api/auth";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifyEmail() {
    const token = new URLSearchParams(window.location.search).get('token');
    const verify = useVerifyEmail(token);
    const qc = useQueryClient();
    useEffect(() => {
        if (!verify.isLoading && verify.data) {
            if (verify.data.success) {
                toast.success("Email verified", { position: "top-center" })
                qc.invalidateQueries({ queryKey: ["users", "me"] })
            }
            else toast.error("Bad token", { position: "top-center" });
        }
    }, [verify.isLoading, verify.data, qc]);

    if (!token) return <Navigate to={"/"} />
    if (verify.isLoading) return <Loading />;
    return <Navigate to={"/"} />
}