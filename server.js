import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();

// Global CORS policy to eliminate cross-origin request blocking
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// In-memory data store for tracking active verification tokens
let otpStore = {}; 

// Configure automated mail transport protocol layer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'dreamjourneyproject@gmail.com',       
        pass: 'slce rfgn ltua owqn'                
    }
});

// Primary Endpoint: Generate and dispatch security authentication token
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Required email parameter registry missing." });
    }

    // Generate a secure 6-digit verification code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = generatedOtp;

    const mailOptions = {
        from: '"Dream Journey Project" <dreamjourneyproject@gmail.com>',
        to: email,
        subject: 'Verification Code for Your Dream Journey Account',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1329; padding: 40px 20px; text-align: center; color: #ffffff;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #1c2541; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border: 1px solid #3a506b;">
              
              <div style="margin-bottom: 25px;">
                <img src="https://i.postimg.cc/brCy5xYY/general-profile-picture-(1).png" alt="Dream Journey Project" style="width: 100px; height: auto; border-radius: 50%; background-color: #ffffff; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);" />
              </div>
              
              <h2 style="color: #5bc0be; margin-top: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Verification Code</h2>
              <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">Hello,<br>Your one-time verification code (OTP) to access your Dream Journey Account is below:</p>
              
              <div style="background: linear-gradient(135deg, #111827, #0b1329); padding: 18px; border-radius: 8px; margin: 20px 0; display: inline-block; min-width: 180px; border: 1px solid #5bc0be;">
                <span style="color: #5bc0be; font-size: 34px; font-weight: bold; letter-spacing: 6px; font-family: monospace;">${generatedOtp}</span>
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 25px;">For security reasons, please do not share this code with anyone. This code is valid for a limited time.</p>
              
              <hr style="border: 0; border-top: 1px solid #3a506b; margin: 30px 0;">
              
              <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Best regards,<br><strong style="color: #5bc0be;">The Dream Journey Team</strong></p>
            </div>
          </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: "OTP successfully sent." });
    } catch (error) {
        console.error("Mailer Transport Error:", error);
        return res.status(500).json({ success: false, message: "Internal mailer transport system failure." });
    }
});

// Verification Endpoint: Check if the entered OTP is correct
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    // Check if OTP exists for this email and matches perfectly
    if (otpStore[email] && otpStore[email] === otp.toString()) {
        delete otpStore[email]; // Security check: Ek baar match hote hi delete kar do
        return res.status(200).json({ success: true, message: "OTP verified successfully. Logging in..." });
    } else {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please try again." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`[Server] Operational on port ${PORT}`));