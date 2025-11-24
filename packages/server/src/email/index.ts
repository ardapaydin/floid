import nodemailer from "nodemailer";
import VerifyEmail from "./templates/verifyEmail";
import EmailLayout from "./templates/layout";
import { render } from "@react-email/components";
import React from "react";
import ResetPassword from "./templates/resetPassword";

const templates = {
  VerifyEmail,
  EmailLayout,
  ResetPassword,
};

export async function sendEmail(
  template: keyof typeof templates,
  email: string,
  data: Record<string, string>
) {
  const TemplateComponent = templates[template];
  const layout = await render(
    React.createElement(EmailLayout, {
      children: React.createElement(TemplateComponent as any, data),
    })
  );

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE == "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: data["subject"],
    html: layout,
  });
}
