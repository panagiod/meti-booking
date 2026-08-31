import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo inválido. Permitidos: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo debe pesar menos de 2MB" },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${session.user.id}-${uuidv4()}.${fileExtension}`;
    const blob = await put(`uploads/avatars/${fileName}`, file, {
      access: "public",
      contentType: file.type,
    });

    // Delete old blob if replacing an existing image
    if (oldUrl && oldUrl.startsWith("http")) {
      try {
        await del(oldUrl);
      } catch (deleteError) {
        console.error("Error deleting old avatar:", deleteError);
      }
    }

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
