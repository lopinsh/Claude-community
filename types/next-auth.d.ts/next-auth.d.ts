import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and `getCsrfToken`.
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  /**
   * The user object has the id property added.
   */
  interface User extends DefaultUser {
    id: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback when a JWT is created.
   */
  interface JWT extends DefaultJWT {
    id: string
  }
}