import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: "ADMIN" | "VENDEUR"
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: "ADMIN" | "VENDEUR"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "VENDEUR"
  }
}