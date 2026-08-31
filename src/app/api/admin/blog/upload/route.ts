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

    const userWithRole = session.user as any;
    if (userWithRole.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be smaller than 5MB" },
        { status: 400 }
      );
    }

    // Upload file to Vercel Blob
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const blob = await put(`uploads/blog/${fileName}`, file, {
      access: "public",
      contentType: file.type,
    });

    // Delete old blob if replacing an existing image
    if (oldUrl && oldUrl.startsWith("http")) {
      try {
        await del(oldUrl);
      } catch (deleteError) {
        console.error("Error deleting old blog image:", deleteError);
      }
    }

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
