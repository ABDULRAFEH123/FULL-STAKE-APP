import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 8);

    // Connect to MongoDB
    await connectMongoDB();

    // Create user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      location:"",
      about:"",
      subscription:"",
    });
    // console.log(newUser, "its ne user...");
    // Generate JWT access token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET
    );
    // console.log(accessToken, "its accessTOken...");

    // Return success response with access token
    return NextResponse.json(
      { message: "User registered successfully.", accessToken },
      { status: 201 }
    );
  } catch (error) {
    // Return error response with the error message
    return NextResponse.json(
      { message: "An error occurred while registering.", error: error.message },
      { status: 500 }
    );
  }
}
