import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// Mock template generator
// Email Templates
const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'DM Sans', sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { margin-bottom: 40px; }
    .card { background: #111; border: 1px solid #222; border-radius: 24px; padding: 40px; }
    h1 { font-family: 'Preahvihear', serif; font-size: 32px; margin-bottom: 20px; color: #fff; }
    p { color: #aaa; line-height: 1.6; font-size: 16px; margin-bottom: 24px; }
    .btn { display: inline-block; background: #fff; color: #000; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 10px; }
    .footer { margin-top: 40px; text-align: center; color: #444; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h2 style="color: #fff; font-family: sans-serif; letter-spacing: -1px; margin: 0;">Edenn.</h2>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Edenn. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const generateEmailHtml = (type: string, data: any) => {
    let content = "";
    
    switch (type) {
        case "welcome":
            content = `
                <h1>Welcome to Edenn, ${data.name}!</h1>
                <p>We're thrilled to have you join our community of creators and studios. Edenn is designed to help you showcase your work, connect with talent, and build the future of gaming.</p>
                <p>Your journey begins now. Upload your first game or complete your profile to get discovered.</p>
                <a href="https://edenn.com/profile" class="btn">Go to Dashboard</a>
            `;
            break;
        case "upvote":
            content = `
                <h1>New Upvote!</h1>
                <p><strong>${data.senderName}</strong> just upvoted your game. Your work is getting noticed!</p>
                <a href="https://edenn.com/games/${data.relatedId}" class="btn">View Game</a>
            `;
            break;
        case "message":
            content = `
                <h1>New Message</h1>
                <p>You have received a new message from <strong>${data.senderName}</strong>.</p>
                <p>"${data.preview || 'Check your inbox to see the message.'}"</p>
                <a href="https://edenn.com/messages" class="btn">Reply Now</a>
            `;
            break;
        case "upload":
             content = `
                <h1>Upload Successful</h1>
                <p>Your game has been successfully uploaded to Edenn. It is now live and visible to the community.</p>
                <a href="https://edenn.com/games/${data.relatedId}" class="btn">View Game</a>
             `;
             break;
        case "follow":
             content = `
                <h1>New Follower</h1>
                <p><strong>${data.senderName}</strong> started following you.</p>
                <a href="https://edenn.com/profile" class="btn">View Profile</a>
             `;
             break;
        default:
            content = `<p>You have a new notification on Edenn.</p>`;
    }

    return baseEmailTemplate(content);
};

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    type: v.string(), // upvote, message, etc.
    data: v.any(), // dynamic data for template
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      return { success: false, error: "Missing API Key" };
    }

    const html = generateEmailHtml(args.type, args.data);

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: "Edenn <noreply@mail.fordestech.com>", // Verified domain
                to: [args.to],
                subject: args.subject,
                html: html,
            }),
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("Resend API Error:", error);
            throw new Error("Failed to send email");
        }

        const data = await res.json();
        return { success: true, id: data.id };
    } catch (err) {
        console.error("Email sending failed:", err);
        return { success: false, error: "Failed to send" };
    }
  },
});
