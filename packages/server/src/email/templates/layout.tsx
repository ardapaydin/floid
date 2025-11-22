import { Body, Container, Html, Section, Text } from "@react-email/components"

export default function EmailLayout({ children }: { children: React.ReactNode }) {
    return (
        <Html>
            <Body style={{
                "margin": 0,
                "padding": "20px",
                "background": "#f4f7fa",
                "fontFamily": "Arial, sans-serif",
                "display": "flex",
                "justifyContent": "center",
                "alignItems": "center",
            }}>
                <Container style={{
                    maxWidth: "500px",
                    width: "100%",
                    margin: "0 auto",
                    background: "#fff",
                    padding: "40px 32px",
                    borderRadius: "16px",
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    boxSizing: "border-box"
                }}
                >
                    <Text style={{
                        fontSize: "26px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        margin: "0 0 32px 0",
                        textAlign: "center"
                    }}>
                        Floid
                    </Text>
                    <Section style={{
                        margin: "0 0 32px 0",
                        padding: "0 8px"
                    }}>
                        {children}
                    </Section>
                    <Text style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        margin: "0",
                        textAlign: "center",
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