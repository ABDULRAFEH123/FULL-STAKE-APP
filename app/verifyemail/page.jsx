import { getServerSession } from "next-auth";
import { authOptions} from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation";
import VerifyEmail from "@/components/VerifyEmail";

export default async function verifyemail() {

  return (
    <div>
      <VerifyEmail />
    </div>
  );
}
