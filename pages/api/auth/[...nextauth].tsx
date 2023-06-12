import GoogleProvider from "next-auth/providers/google";
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async session({ session }:{ session: any}) {
            //retrieve ROLE and assign to session after signed in
            const apiUrlEndpoint = `${process.env.API_ENDPOINT}/api/fetchSql`;
            const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    action: 'fetch',
                    query: 'fetchRoleQuery',
                    para: [session.user.email]
                })
            }
            const response = await fetch(apiUrlEndpoint, postData);
            const res = await response.json();
            let role = res.data[0].ROLE;
            session.user.role = role;
            return session;
        },
    },
})
