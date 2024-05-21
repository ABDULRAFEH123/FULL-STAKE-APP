import Home from "@/components/Home";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Login from "@/components/Login";

export default async function login() {

  return (
    <div>
      <Login />
    </div>
  );
}
