// /api/get-subscription.js
import { connectMongoDB } from "@/lib/mongodb";
import User from "../../../models/user"; // Adjust the import based on your directory structure
import { NextResponse } from "next/server";

export async function POST(req, res) {
  await connectMongoDB();
  
  const { email } = await req.json();
  console.log(email, "email here");

  try {
    const user = await User.findOne({ email: email });
    // console.log(user,"whole obj of user ")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the entire subscription object if it exists
    if (user.subscription) {
      return NextResponse.json({ subscription: user.subscription }, { status: 200 });
    } else {
      // Return an empty object if no subscription exists
      return NextResponse.json({ subscription: {} }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
