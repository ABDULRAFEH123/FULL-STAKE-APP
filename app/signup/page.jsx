import Signup from "@/components/Signup";
import { getServerSession } from "next-auth";
import { authOptions} from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation";

export default async function signup() {

  return (
    <div>
      <Signup />
    </div>
  );
}
