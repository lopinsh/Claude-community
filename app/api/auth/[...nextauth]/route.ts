// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Imports the new configuration file

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };