import { Button, Section, Text } from "@react-email/components";

export default function ResetPassword({ url }: { url: string }) {
    return (
        <>
            <Text>You are receiving this email because a password reset was requested for your account</Text>
            <Text style={{ fontWeight: "bold" }}>If you did not requested this, please ignore this mail.</Text>
            <Section style={{ textAlign: "center", margin: "20px 0" }}>
                <Button
                    href={url}
                    style={{
                        background: "#333",
                        color: "white",
                        padding: "12px 24px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "16px",
                        textDecoration: "none",
                        display: "inline-block"
                    }}>
                    Reset Password
                </Button>
            </Section>

            <Text>This link is valid for 30 minutes.</Text>
        </>
    )
}