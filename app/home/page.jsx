import Home from "@/components/Home";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function home() {
  const session = await getServerSession(authOptions);
  console.log("IN HOME PAGE...");
  if (!session) redirect("/login");
  return (
    <div>
      <Home />
    </div>
  );
}
