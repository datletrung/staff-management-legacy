import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";


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
            const apiUrlEndpoint = 'http://localhost:3000/api/fetchSql';
            const postData = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json '},
                body: JSON.stringify({
                    action: 'fetch',
                    query: 'fetchRoleQuery',
                    para: ['brianle@lionrocktech.net']
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
