import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Import JWT to decode the token

export async function PUT(req) {
    // console.log(req.headers);
    try {
      // Connect to the MongoDB database
      await connectMongoDB();
  
      // Decode the token to retrieve the email
      const token = req.headers.get("token");
      console.log("Token from 'token':", token);
      if (!token) {
        return new NextResponse("Token is required", { status: 401 });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded, "its Decodedtoken...");
      const email = decoded.email;
      if (!email) {
        return new NextResponse("Invalid token", { status: 401 });
      }
      
      // Properly read the request body once
      const requestBody = await req.json();
      console.log("Request Body:", requestBody);
  
      const { password } = requestBody;
      if (!password) {
        return new NextResponse("New password is required", { status: 400 });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      console.log(salt, "its salt...");
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log(hashedPassword, "its hashedPassword...");
  
      // Update the user's password in the database
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { password: hashedPassword } },
        { new: true }
      );
      console.log(updatedUser, "its updatedUser in resetPassword...");
      if (!updatedUser) {
        return new NextResponse("User not found", { status: 404 });
      }
  
      // Respond with success message
      return new NextResponse({msg:"Password reset successfully" }, { status: 200 });
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  
