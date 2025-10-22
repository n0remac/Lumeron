import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GenerateSticker } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = GenerateSticker.parse(body);

    // TODO: Implement actual AI generation
    // For now, create a placeholder design
    const designs = [];

    for (let i = 0; i < validatedData.count; i++) {
      const design = await prisma.design.create({
        data: {
          prompt: validatedData.prompt,
          tags: validatedData.theme || "",
          status: "draft",
        },
      });

      designs.push(design);
    }

    return NextResponse.json({
      success: true,
      count: designs.length,
      designs,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
