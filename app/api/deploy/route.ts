import { NextRequest, NextResponse } from "next/server";
import { createDeployment } from "@/lib/fly";

export async function POST(request: NextRequest) {
  try {
    const { telegramToken, aiApiKey, aiModel, aiProvider } =
      await request.json();

    if (!telegramToken || !aiApiKey || !aiModel || !aiProvider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { projectId, serviceId, environmentId } = await createDeployment(
      telegramToken,
      aiApiKey,
      aiModel,
      aiProvider
    );

    return NextResponse.json({
      projectId,
      serviceId,
      environmentId,
      status: "deploying",
    });
  } catch (error) {
    console.error("Deploy error:", error);
    const message =
      error instanceof Error ? error.message : "Deployment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
