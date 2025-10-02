// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import { prisma } from './prisma';
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Auth failed: Missing credentials')
                    return null
                }

                console.log('🔍 Looking up user:', credentials.email)

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user) {
                    console.log('❌ Auth failed: User not found')
                    return null
                }

                if (!user.password) {
                    console.log('❌ Auth failed: User has no password')
                    return null
                }

                console.log('🔐 Comparing passwords...')
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    console.log('❌ Auth failed: Invalid password')
                    return null
                }

                console.log('✅ Auth successful for:', user.email, 'Role:', user.role)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                } as any
            }
        })
    ],
    session: {
        strategy: "jwt" as const
    },
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
                token.role = user.role // Get role from user object returned by authorize
            }
            return token
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id
                session.user.role = token.role || 'USER'
            }
            return session
        }
    }
}