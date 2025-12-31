import { internalAction } from "./_generated/server";
import { v } from "convex/values";

// Mock template generator
// Email Templates
const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edenn Notification</title>
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark">
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505 !important; color: #ffffff !important; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #050505 !important; }
    .content-wrapper { padding: 40px 20px; }
    .header { text-align: center; padding-bottom: 30px; }
    .logo-text { font-family: 'Arial', sans-serif; font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #ffffff; text-decoration: none; }
    .card { background-color: #111111; border: 1px solid #222222; border-radius: 16px; padding: 40px 30px; text-align: left; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    h1 { margin-top: 0; font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.5px; }
    p { margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a1a1aa; }
    .btn { display: inline-block; background-color: #ffffff; color: #000000; font-weight: 600; font-size: 15px; padding: 12px 30px; border-radius: 9999px; text-decoration: none; transition: background 0.2s; }
    .btn:hover { background-color: #e4e4e7; }
    .footer { padding-top: 30px; text-align: center; color: #52525b; font-size: 12px; }
    .footer a { color: #52525b; text-decoration: underline; }
    @media only screen and (max-width: 600px) {
      .card { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content-wrapper">
      <div class="header">
        <!-- Using text logo as reliable fallback, but aiming for visuals -->
        <a href="https://edenn.vercel.app" class="logo-text">edenn.</a>
      </div>
      <div class="card">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Edenn. All rights reserved.<br>
        <a href="https://edenn.vercel.app/settings">Unsubscribe</a> from these notifications.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const generateEmailHtml = (type: string, data: any) => {
    let content = "";
    const baseUrl = "https://edenn.vercel.app";
    
    switch (type) {
        case "welcome":
            content = `
                <h1>Welcome to Edenn, ${data.name}!</h1>
                <p>We are incredibly excited to welcome you to <strong>Edenn</strong> — the premier destination for game creators, studios, and enthusiasts.</p>
                <p>Your journey to showcase your creativity and connect with top-tier talent starts here. Whether you're here to publish your first game, find collaborators, or simply explore, we have everything you need.</p>
                <p style="margin-bottom: 24px;">Complete your profile to stand out and help the community find you.</p>
                <div style="text-align: center;">
                    <a href="${baseUrl}/profile" class="btn">Complete Your Profile</a>
                </div>
            `;
            break;
        case "upvote":
            content = `
                <h1>Huge Upvote! 🚀</h1>
                <p>Great news! <strong>${data.senderName}</strong> just upvoted your game. Your creativity is resonating with the community.</p>
                <div style="text-align: center;">
                    <a href="${baseUrl}/games/${data.relatedId}" class="btn">View Game</a>
                </div>
            `;
            break;
        case "upvote_profile":
            content = `
                <h1>New Profile Upvote! 🌟</h1>
                <p><strong>${data.senderName}</strong> just upvoted your studio profile! Your reputation is growing in the community.</p>
                <div style="text-align: center;">
                    <a href="${baseUrl}/profile/${data.relatedId || ''}" class="btn">View Your Profile</a>
                </div>
            `;
            break;
        case "message":
            content = `
                <h1>New Message Received</h1>
                <p>You have a new message from <strong>${data.senderName}</strong> waiting for you.</p>
                <p style="background: #1a1a1a; padding: 15px; border-radius: 8px; font-style: italic; border-left: 3px solid #7628DB;">"${data.preview || 'Check your inbox to read the full message.'}"</p>
                <div style="text-align: center;">
                    <a href="${baseUrl}/messages" class="btn">Reply Now</a>
                </div>
            `;
            break;
        case "upload":
             content = `
                <h1>Upload Successful! 🎉</h1>
                <p>Congratulations! Your game has been successfully processed and is now live on Edenn.</p>
                <p>Share it with your network to start getting feedback and upvotes.</p>
                <div style="text-align: center;">
                    <a href="${baseUrl}/games/${data.relatedId}" class="btn">View Your Game</a>
                </div>
             `;
             break;
        case "follow":
             content = `
                <h1>New Follower 👤</h1>
                <p><strong>${data.senderName}</strong> is now following you! Keep sharing great content to grow your audience.</p>
                <div style="text-align: center;">
                    <a href="${baseUrl}/profile" class="btn">View Profile</a>
                </div>
             `;
             break;
        default:
            content = `<p>You have a new notification on Edenn.</p> <div style="text-align: center;"><a href="${baseUrl}" class="btn">Open Edenn</a></div>`;
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
                from: "edenn. <noreply.eden@mail.fordestech.com>", // Verified domain
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
