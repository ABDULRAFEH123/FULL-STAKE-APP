import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Import JWT to generate a token

export async function POST(req) {
  try {
    await connectMongoDB();
    const { otp } = await req.json();
    console.log(otp, "Received OTP for verification");

    const currentDateTime = new Date();
    console.log(`Current Date and Time: ${currentDateTime}`);

    // Find users with the given OTP regardless of expiry date
    const usersWithOtp = await User.find({ otp: otp.toString() });
    console.log(`Users with OTP ${otp.toString()}:`, usersWithOtp);

    if (usersWithOtp.length === 0) {
      console.log("No users found with the provided OTP.");
      return new NextResponse(
        JSON.stringify({ message: "Invalid or expired OTP" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Now find the user with the valid OTP expiry
    const user = await User.findOne({
      otp: otp.toString(),
      otpExpiry: { $gt: currentDateTime }, // Checks if the OTP is still valid
    });

    // Add debug logs for the user query
    console.log(
      `Querying user with OTP: ${otp.toString()} and OTP expiry greater than: ${currentDateTime}`
    );

    if (!user) {
      console.log("User not found with the provided OTP or OTP expired.");
      return new NextResponse(
        JSON.stringify({ message: "Invalid or expired OTP" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("User found with OTP:", user.otp);

    // Generate a secure token with the user's email
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // Token expires in 8 hours
    );
    console.log(token, "its token in otp page...");

    // Clear the OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    console.log("OTP verified successfully.");
    return new NextResponse(
      JSON.stringify({ message: "OTP verified successfully.", token: token }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to verify OTP:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error verifying OTP",
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


