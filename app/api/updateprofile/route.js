import { getSession } from "next-auth/react";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  // Extract the Authorization header
  const authHeader = req.headers.get("authorization");
  // console.log(authHeader, "its ... first step");

  let token;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Extract the token after 'Bearer '
    // console.log("Extracted Token:", token);
  } else {
    // Handle case where Authorization header is missing or does not start with 'Bearer '
    return NextResponse.json(
      { message: "Invalid authorization header" },
      { status: 401 }
    );
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decodedToken);
  } catch (error) {
    console.error("Error decoding token:", error);
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    );
  }

  const userId = decodedToken.userId;
  // console.log("User ID from token:", userId);

  // Connect to MongoDB
  await connectMongoDB();

  const user = await User.findById(userId);
  // console.log(user,"db user.........")
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { name, location, about } = await req.json();

  console.log(name,location,about," its three main things...")
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        location,
        about,
      },
      { new: true }
    );
    // console.log(updatedUser,"its uppdated user...")

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update the session with the new user details
    user.name = updatedUser.name;
    user.location = updatedUser.location;
    user.about = updatedUser.about;
     console.log(updatedUser,"its uppdated user...")
     console.log(user.name,"its uppdated userNAMEEEE...")


    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

