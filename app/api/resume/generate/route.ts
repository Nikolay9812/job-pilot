import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { generateResumePdfFromProfile } from "@/agent/resume-generator";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseProfileRecord } from "@/lib/profile";

export const runtime = "nodejs";

type InsforgeServerClient = Awaited<ReturnType<typeof createInsforgeServer>>;

export async function POST(): Promise<NextResponse> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: userError } = await insforge.auth.getCurrentUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in again before generating your resume." },
        { status: 401 },
      );
    }

    const { data: profileData, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[resume/generate]", profileError);
      return NextResponse.json(
        { success: false, error: "We could not load your saved profile." },
        { status: 500 },
      );
    }

    const profile = parseProfileRecord(profileData);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Save a complete profile before generating a resume." },
        { status: 400 },
      );
    }

    if (!profile.is_complete) {
      return NextResponse.json(
        { success: false, error: "Complete and save your profile before generating a resume." },
        { status: 400 },
      );
    }

    const generation = await generateResumePdfFromProfile(profile);
    if (!generation.success) {
      return NextResponse.json(
        { success: false, error: generation.error },
        { status: generation.status ?? 422 },
      );
    }

    const upload = await replaceResumeFile(
      insforge,
      userData.user.id,
      profile.resume_pdf_key,
      generation.pdfBuffer,
    );

    if (!upload.success) {
      return NextResponse.json(
        { success: false, error: upload.error },
        { status: 500 },
      );
    }

    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({
        resume_pdf_url: upload.url,
        resume_pdf_key: upload.key,
      })
      .eq("id", userData.user.id);

    if (updateError) {
      console.error("[resume/generate]", updateError);
      return NextResponse.json(
        { success: false, error: "We could not save your generated resume." },
        { status: 500 },
      );
    }

    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      data: { resumePdfUrl: upload.url },
    });
  } catch (error) {
    console.error("[resume/generate]", error);
    return NextResponse.json(
      { success: false, error: "We could not generate your resume." },
      { status: 500 },
    );
  }
}

async function replaceResumeFile(
  insforge: InsforgeServerClient,
  userId: string,
  existingKey: string | null,
  pdfBuffer: Buffer,
): Promise<
  | { success: true; url: string; key: string }
  | { success: false; error: string }
> {
  const targetKey = `${userId}/resume.pdf`;
  const keysToRemove = new Set([targetKey]);

  if (existingKey) {
    keysToRemove.add(existingKey);
  }

  for (const key of keysToRemove) {
    await insforge.storage.from("resumes").remove(key);
  }

  const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
    type: "application/pdf",
  });
  const { data, error } = await insforge.storage.from("resumes").upload(targetKey, pdfBlob);

  if (error) {
    console.error("[resume/generate]", error);
    return { success: false, error: "We could not upload your generated resume." };
  }

  const uploadData: unknown = data;
  if (!isUploadData(uploadData)) {
    return { success: false, error: "We could not confirm the generated resume upload." };
  }

  return { success: true, url: uploadData.url, key: uploadData.key };
}

function isUploadData(value: unknown): value is { url: string; key: string } {
  return (
    isRecord(value) &&
    typeof value.url === "string" &&
    typeof value.key === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
