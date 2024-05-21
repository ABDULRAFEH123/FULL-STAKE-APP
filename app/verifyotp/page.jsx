import VerifyOtp from "@/components/VerifyOtp";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function verifyotp()  {

  return (
    <div>
      <VerifyOtp />
    </div>
  );
}
