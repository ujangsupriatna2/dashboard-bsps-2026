import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "Code diperlukan" },
        { status: 400 }
      );
    }

    const validCode = (process.env.AUTH_CODE || "").trim();

    if (code.trim() === validCode) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Code salah" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
