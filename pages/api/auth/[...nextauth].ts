import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getOrCreateUser } from "../../../contentful";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "me@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      authorize: async (credentials) => {
        if (
          typeof credentials?.email === "undefined" &&
          typeof credentials?.password === "undefined"
        ) {
          throw new Error("Wrong credentials. Try again");
        }
        return getOrCreateUser(credentials?.email, credentials?.password);
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account && account.provider === "google" && profile?.email) {
        getOrCreateUser(profile.email, "");
        return true;
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
    async jwt({ token }) {
      token.userRole = "admin";
      return token;
    },
  },
};

export default NextAuth(authOptions);
