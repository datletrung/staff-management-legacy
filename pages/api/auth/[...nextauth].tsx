import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { fetchRoleQuery } from './fetchRole';

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
            const mysql = require('serverless-mysql')({
                config: {
                    host     : process.env.sqlHostName,
                    database : process.env.sqlDatabase,
                    user     : process.env.sqlUsername,
                    password : process.env.sqlPassword
                }
            });
            let role = await JSON.stringify(await mysql.query(fetchRoleQuery,
                                                                [ session.user.email ]
            ));
            await mysql.end();
            session.user.role = await JSON.parse(role)[0]['ROLE'];
            return session;
        },
    },
})
