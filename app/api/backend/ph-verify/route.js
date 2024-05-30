import { connectMongoDB } from "@/lib/mongodb";
import { generateOTP, sendOTP, saveOTPToUser } from '../../../../lib/otp';
import { NextResponse } from "next/server";

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  await connectMongoDB();

  const { email, phoneNumber } = await req.json();

  console.log(email,phoneNumber,"its both mail and number...")
  if (!email || !phoneNumber) {
    return NextResponse.json({ message: 'Email and phone number are required' }, { status: 400 });
  }

  try {
    const otp = generateOTP();
    await saveOTPToUser(email, otp);
    await sendOTP(phoneNumber, otp);

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Error sending OTP' }, { status: 500 });
  }
}
