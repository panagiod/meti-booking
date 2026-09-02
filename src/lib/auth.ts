import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { getAuthBaseURL, getTrustedAuthOrigins } from "@/lib/auth-config";
import { getBetterAuthDatabaseProvider } from "@/lib/database-provider";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";

const trustedOrigins = getTrustedAuthOrigins();

export const auth = betterAuth({
  baseURL: getAuthBaseURL(),
  ...(trustedOrigins.length > 0 ? { trustedOrigins } : {}),
  database: prismaAdapter(prisma, {
    provider: getBetterAuthDatabaseProvider(),
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
  ...(isGoogleOAuthConfigured()
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  // E2E tests create many users in succession: disable rate limit
  // explicitly for the suite (env DISABLE_RATE_LIMIT=1).
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
          // Create default ClientProfile for all new users
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

// Helper to check if any admins exist
export async function hasAdmins(): Promise<boolean> {
  const adminCount = await prisma.adminProfile.count();
  return adminCount > 0;
}
