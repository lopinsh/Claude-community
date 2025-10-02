import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and `getCsrfToken`.
   */
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  /**
   * The user object has the id and role properties added.
   */
  interface User extends DefaultUser {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback when a JWT is created.
   */
  interface JWT extends DefaultJWT {
    id: string
    role: UserRole
  }
}