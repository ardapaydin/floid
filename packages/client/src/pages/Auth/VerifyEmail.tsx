import Loading from "@/components/Loading/Loading";
import { useVerifyEmail } from "@/utils/api/auth";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function VerifyEmail() {
    const token = new URLSearchParams(window.location.search).get('token');
    const verify = useVerifyEmail(token);

    useEffect(() => {
        if (!verify.isLoading && verify.data) {
            if (verify.data.success) toast.success("Email verified", { position: "top-center" });
            else toast.error("Bad token", { position: "top-center" });
        }
    }, [verify.isLoading, verify.data]);

    if (!token) return <Navigate to={"/"} />
    if (verify.isLoading) return <Loading />

    return <Navigate to={"/"} />
}