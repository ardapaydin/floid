import { Button, Section, Text } from "@react-email/components";

export default function VerifyEmail({ url }: { url: string }) {
    return (
        <>
            <Text style={{ fontWeight: "bold" }}>Welcome!</Text>
            <Text style={{ marginBottom: "10px" }}>
                We're excited to have you with us. Please verify your email address to activate your account and get started.
            </Text>
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
                    Verify Email
                </Button>
            </Section>
        </>
    )
}