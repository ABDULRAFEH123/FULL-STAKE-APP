
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

// FUNCTION TO VALIDATE USER FOR NOT MAKING USER WITH SAME EMAIL..
// API route: /api/userexist
export async function POST(req) {
  try {
    await connectMongoDB();
    const { email } = await req.json();
    const user = await User.findOne({ email }).select("_id");

    if (user) {
      return NextResponse.json({ userExists: true }, { statusCode: 200 });
    } else {
      return NextResponse.json({ userExists: false }, { statusCode: 200 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Error checking user existence",
      error: error.message,
    }, { statusCode: 500 });
  }
}

  