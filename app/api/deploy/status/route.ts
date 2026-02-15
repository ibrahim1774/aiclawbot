import { NextRequest, NextResponse } from "next/server";
import { getDeploymentStatus, getMachineLogs } from "@/lib/fly";

export async function GET(request: NextRequest) {
  try {
    const serviceId = request.nextUrl.searchParams.get("serviceId");
    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!serviceId || !projectId) {
      return NextResponse.json(
        { error: "Missing serviceId or projectId parameter" },
        { status: 400 }
      );
    }

    const result = await getDeploymentStatus(serviceId, projectId);

    // On failure, fetch machine events for debugging
    if (result.status === "failed" && result.deploymentId) {
      console.error(
        "Machine FAILED — rawStatus:",
        result.rawStatus,
        "machineId:",
        result.deploymentId
      );

      try {
        const logs = await getMachineLogs(projectId, serviceId);

        if (logs.length > 0) {
          console.log("=== MACHINE EVENTS ===");
          logs.forEach((l) => console.log(`  [${l.severity}] ${l.message}`));
        } else {
          console.log("=== NO EVENTS AVAILABLE ===");
        }

        return NextResponse.json({
          status: result.status,
          deploymentId: result.deploymentId,
          rawStatus: result.rawStatus,
          logs: logs.map((l) => l.message),
          buildLogs: [],
        });
      } catch (logErr) {
        console.error("Failed to fetch machine logs:", logErr);
      }
    }

    return NextResponse.json({
      status: result.status,
      deploymentId: result.deploymentId,
      rawStatus: result.rawStatus,
    });
  } catch (error) {
    console.error("Status check error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to check status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
