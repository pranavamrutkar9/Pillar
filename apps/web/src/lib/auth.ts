import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId : process.env.GITHUB_CLIENT_ID as string,
      clientSecret : process.env.GITHUB_CLIENT_SECRET as string,
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        try {
          const apiUrl = process.env.API_URL || 'http://localhost:4000';
          const res = await fetch(`${apiUrl}/api/auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              username: user.name || (profile as any).login,
              avatarUrl: user.image,
              githubId: (profile as any).id?.toString(),
              githubUsername: (profile as any).login,
            }),
          });
          
          if (!res.ok) {
            console.error('Failed to upsert user on backend', await res.text());
            return false;
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    // signIn: "/auth/signin", // Example custom sign-in page
  },
};
