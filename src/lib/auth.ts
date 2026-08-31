import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  // Los tests E2E crean muchos usuarios seguidos: desactivar rate limit
  // explícitamente para la suite (env DISABLE_RATE_LIMIT=1).
  rateLimit: process.env.DISABLE_RATE_LIMIT === "1" ? { enabled: false } : undefined,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CLIENT",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Crear ClientProfile por defecto para todos los usuarios nuevos
          await prisma.clientProfile.create({
            data: {
              userId: user.id,
            },
          });
        },
      },
    },
  },
  plugins: [],
});

export type Session = typeof auth.$Infer.Session;

// Helper para verificar si hay admins
export async function hasAdmins(): Promise<boolean> {
  const adminCount = await prisma.adminProfile.count();
  return adminCount > 0;
}
