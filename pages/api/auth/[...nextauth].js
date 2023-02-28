import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getOrCreateUser } from "../../../contentful";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account && account.provider === "google" && profile?.email) {
        getOrCreateUser(profile.email, "");
        return true;
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
  },
};

export default NextAuth(authOptions);
