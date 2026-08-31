import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { requireAdminSession } from "@/lib/admin-auth";
import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageKey = formData.get("imageKey") as string | null;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!imageKey || !["hero", "reformer"].includes(imageKey)) {
      return NextResponse.json({ error: "Invalid imageKey" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be smaller than 5MB" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${imageKey}-${uuidv4()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/studio/${fileName}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      url = blob.url;

      if (oldUrl && oldUrl.startsWith("http")) {
        try {
          await del(oldUrl);
        } catch (deleteError) {
          console.error("Error deleting old studio image:", deleteError);
        }
      }
    } else {
      const uploadDir = join(process.cwd(), "public/uploads/studio");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, fileName), buffer);
      url = `/uploads/studio/${fileName}`;
    }

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("[admin/studio/upload] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
