import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { ClientPhoneError, normalizeClientPhone } from "@/lib/client-phone";

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(32).optional(),
});

// GET: Get client profile
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        client: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update client profile
export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Update User fields
    const userUpdates: Record<string, string> = {};
    if (validatedData.name !== undefined) userUpdates.name = validatedData.name;
    if (validatedData.image !== undefined) userUpdates.image = validatedData.image || "";

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdates,
      });
    }

    if (validatedData.phone !== undefined) {
      let phone: string | null;
      try {
        phone = normalizeClientPhone(validatedData.phone);
      } catch (error) {
        if (error instanceof ClientPhoneError) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }
      await prisma.clientProfile.upsert({
        where: { userId: session.user.id },
        update: { phone },
        create: { userId: session.user.id, phone },
      });
    }

    // Return updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        client: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error updating client profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
