import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token parameter" },
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: "Invalid token or Telegram API error" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      username: data.result.username,
      firstName: data.result.first_name,
    });
  } catch (error) {
    console.error("Bot info error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch bot info";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
