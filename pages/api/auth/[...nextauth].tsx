import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { createHash } from 'crypto';

declare module "next-auth" {
    interface Session {
        user: {
            role?: string
        } & DefaultSession["user"]
    }
}

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email or User ID', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const payload = {
                    email: credentials?.email,
                    password: createHash('sha256').update(credentials?.password!).digest('hex'),
                  };

                const apiUrlEndpoint = `${process.env.API_ENDPOINT}/api/fetchSql`;
                const postData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json '},
                    body: JSON.stringify({
                        action: 'fetch',
                        query: 'fetchRole',
                        para: [payload.email, payload.email, payload.password]
                    })
                }
                const response = await fetch(apiUrlEndpoint, postData);
                const res = await response.json();

                if (!response.ok) {
                    throw new Error(res.message);
                }
                if (response.ok && res.data.length === 0) {
                    throw new Error('Incorrect Email/User ID or Password!');
                }
                
                const user_id = res.data[0].USER_ID;
                const email = res.data[0].EMAIL;
                const role = res.data[0].ROLE;
                const name = res.data[0].NAME;
                if (response.ok && role) {
                    return {id: user_id,
                            email: email,
                            name: name,
                            role: role,
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }:{ token: any, user: any}) {
            if (user) {
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }:{ session: any, token: any}) {
            session.user.role = token.role;
            session.user.email = token.email;
            return session;
        },
    },
    theme: {
        colorScheme: 'light',
    },
});