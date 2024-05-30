import twilio from 'twilio';
import User from '../models/user';
import { v4 as uuidv4 } from 'uuid';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    // console.log(message,"its whole message.. of sendOTP")
    return message.sid;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const saveOTPToUser = async (email, otp) => {
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await User.updateOne({ email }, { otp, otpExpiry });
};
