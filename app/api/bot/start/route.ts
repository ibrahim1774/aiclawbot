import { NextRequest, NextResponse } from "next/server";
import { startDeployment } from "@/lib/fly";

export async function POST(request: NextRequest) {
  try {
    const { serviceId, projectId } = await request.json();

    if (!serviceId || !projectId) {
      return NextResponse.json(
        { error: "Missing serviceId or projectId" },
        { status: 400 }
      );
    }

    await startDeployment(serviceId, projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Start error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start bot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
