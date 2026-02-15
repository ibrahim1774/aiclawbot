import { NextRequest, NextResponse } from "next/server";
import { getMachineLogs } from "@/lib/fly";

export async function GET(request: NextRequest) {
  try {
    const deploymentId = request.nextUrl.searchParams.get("deploymentId");
    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!deploymentId || !projectId) {
      return NextResponse.json(
        { error: "Missing deploymentId or projectId parameter" },
        { status: 400 }
      );
    }

    const logs = await getMachineLogs(projectId, deploymentId);

    return NextResponse.json({
      buildLogs: [],
      deploymentLogs: logs,
      errors: {
        buildLogs: null,
        deploymentLogs: null,
      },
    });
  } catch (error) {
    console.error("Logs fetch error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
