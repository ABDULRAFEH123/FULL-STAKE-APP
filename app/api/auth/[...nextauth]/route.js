import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt for token generation

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credential",
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          const user = await User.findOne({ email });
          await connectMongoDB();
          if (!user) {
            console.log("No user found with that email");
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            console.log("Password does not match");
            return null;
          }
          return user;
        } catch (error) {
          console.error("Error in authorize function", error);
          throw new Error("An error occurred during authorization");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Session expiration time in seconds
  },
  callbacks: {
    jwt: async ({ token, user, account ,trigger,session}) => {
      // new code to update the user info like name address and location
      if(trigger === "update"){
        return {...token,...session.user}
      }
      

      if (account && user) {
        // This happens only on the first login, so you can capture tokens from the account
        token.accessToken = account.access_token;
      }

      if (user) {
        // Attach additional user details to the JWT token object
        token.uid = user._id;
        token.email = user.email;
        token.name = user.name;
        token.location = user.location;
        token.about = user.about;
        token.subscription=user.subscription
        // Generate access token using jwt.sign
        token.accessToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET
        );
      }
      return token;
    
    
    },
    session: async ({ session, token }) => {
      // Ensure the session includes all necessary user details
      if (token) {
        session.user.id = token.uid;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.subscription=token.subscription;
        // session.user.location = token.location;
        // session.user.about = token.about;
        if (token.accessToken) {
          session.user.accessToken = token.accessToken;
        }
      }
      console.log(session,"its overall session..");

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/home", // Custom sign-in page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
