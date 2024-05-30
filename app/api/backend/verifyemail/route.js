// File: app/api/verifyemail/route.js
import nodemailer from "nodemailer";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    await connectMongoDB();

    const { email } = await req.json();
    if (!email) {
      return new NextResponse(
        JSON.stringify({ message: "Email is required." }),
        {
          status: 400,
        }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User cannot be found." }),
        {
          status: 404,
        }
      );
    }

    // More secure temporary password generation
    const tempPassword = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
    console.log(tempPassword, "its tempPassword..");
    // Assuming user is fetched from the database:
    user.otp = tempPassword.toString();
    user.otpExpiry = new Date(Date.now() + 30 * 6000000000); // 30 minutes from now
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Password Reset",
      text: `Your temporary password is: ${tempPassword}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully.");

    return new NextResponse(
      JSON.stringify({ message: "Temporary password sent to your email." }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to process the request:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error processing request",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
