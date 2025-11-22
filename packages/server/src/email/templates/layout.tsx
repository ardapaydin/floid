import { Body, Container, Html, Section, Text } from "@react-email/components"
export default function EmailLayout({ children }: { children: React.ReactNode }) {
    return (
        <Html>
            <Body style={{
                "margin": 0,
                "padding": 0,
                "background": "#f4f7fa",
                "fontFamily": "Arial, sans-serif",
                "minHeight": "100vh",
                "display": "flex",
                "justifyContent": "center",
                "alignItems": "center",
            }}>
                <Container style={{
                    maxWidth: "500px",
                    width: "100%",
                    margin: "40 16px",
                    background: "#fff",
                    padding: "32 28px",
                    borderRadius: "16px",
                    border: "1px solid #e0e0e75",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    boxSizing: "border-box"
                }}
                >
                    <Text style={{
                        fontSize: "26px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        marginBottom: "18px",
                        textAlign: "center"
                    }}>
                        Floid
                    </Text>
                    <Section style={{ padding: "0 10px" }}>{children}</Section>
                    <Text style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        marginBottom: "18px",
                        textAlign: "center",
                        marginTop: "24px",
                        fontFamily: "monospace",
                        color: "#aaa",
                        display: "block"
                    }}>
                        © Floid
                    </Text>
                </Container>
            </Body>
        </Html >
    )
}