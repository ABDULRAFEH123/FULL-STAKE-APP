import Home from "@/components/Home";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Login from "@/components/Login";
import { ResetPassword } from "@/components/ResetPassword";

export default async function resetPassword() {

  return (
    <div>
      <ResetPassword />
    </div>
  );
}
