import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId : process.env.GITHUB_CLIENT_ID as string,
      clientSecret : process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const apiUrl = process.env.API_URL || 'http://localhost:4000';
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.username,
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Credentials error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Credentials provider — user.id is already the db cuid from authorize()
      if (account?.provider === "credentials" && user) {
        token.sub = user.id;
      }
      
      // initial sign in
      if (account?.provider === "github" && profile && user) {
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
          
          if (res.ok) {
            const data = await res.json();
            // Set the token.sub to the database cuid(), NOT the github ID
            token.sub = data.user.id;
          } else {
            console.error('Failed to upsert user on backend', await res.text());
          }
        } catch (error) {
          console.error('Error in jwt callback:', error);
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth",
  },
};
