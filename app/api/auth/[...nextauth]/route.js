import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt for token generation
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import LinkdinProvider from "next-auth/providers/linkedin";
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
    GoogleProvider({
      clientId: process.env.CLIENT_ID_GOOGLE,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE,
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code",
    }),
    GithubProvider({
      clientId: process.env.CLIENT_ID_GITHUB,
      clientSecret: process.env.CLIENT_SECRET_GITHUB,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.CLIENT_ID_FACEBOOK,
      clientSecret: process.env.CLIENT_SECRET_FACEBOOK,
      authorizationUrl: "https://www.facebook.com/v10.0/dialog/oauth?scope=email,public_profile",
      authorization: {
        params: {
          prompt: "login",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    LinkdinProvider({
      clientId: process.env.CLIENT_ID_LINKDIN,
      clientSecret: process.env.CLIENT_SECRET_LINKDIN,
      authorization: {
        params: { scope: "openid profile email" },
        url: "https://www.linkedin.com/oauth/v2/authorization",
      },
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      profileUrl: "https://api.linkedin.com/v2/userinfo",
      authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      issuer: "https://www.linkedin.com/oauth",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Session expiration time in seconds
  },
  callbacks: {
    async signIn({ account, user }) {
      // console.log(account,"its account")
      // console.log(user,"its user")
      await connectMongoDB();
      if (["google", "github", "facebook","linkdin"].includes(account.provider)) {
        // Check if user exists in the database
        let newUser = await User.findOne({ email: user.email });
        if (!newUser) {
          // If user doesn't exist, create a new user
          newUser = await User.create({
            email: user.email,
            name: user.name,
            password: user.password,
            location: "", // You can update these values later
            about: "",
            subscription: {
              status: "inactive",
              subscriptionId: null,
              createdDate: null,
              endingDate: null,
              planId: null,
              active: false,
            },
          });
        }
      }
      return true;
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      // new code to update the user info like name address and location
      if (trigger === "update") {
        return { ...token, ...session.user };
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
        token.subscription = user.subscription
          ? user.subscription.status
          : "inactive"; // Add subscription status
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
        session.user.subscription = token.subscription; // Ensure subscription is included
        // session.user.location = token.location;
        // session.user.about = token.about;
        if (token.accessToken) {
          session.user.accessToken = token.accessToken;
        }
      }
      console.log(session, "its overall session..");

      return session;
    },
    // REDIRECT USER TO HOME PAGE AFTER THE LOGIN..
    async redirect({ url, baseUrl }) {
      return baseUrl + "/home";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/login",
    signUp: "/signup", // Custom sign-in pag
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
