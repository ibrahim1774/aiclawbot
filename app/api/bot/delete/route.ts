import { NextRequest, NextResponse } from "next/server";
import { deleteDeployment } from "@/lib/fly";

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    await deleteDeployment(projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete bot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
