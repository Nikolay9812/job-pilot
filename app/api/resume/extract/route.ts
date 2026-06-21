import { NextResponse } from "next/server";
import { extractProfileFromResumeBuffer } from "@/agent/resume-extractor";
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
        { success: false, error: "Please sign in again before extracting your resume." },
        { status: 401 },
      );
    }

    const { data: profileData, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[resume/extract]", profileError);
      return NextResponse.json(
        { success: false, error: "We could not load your saved resume." },
        { status: 500 },
      );
    }

    const profile = parseProfileRecord(profileData);
    if (!profile?.resume_pdf_key) {
      return NextResponse.json(
        { success: false, error: "Upload and save a resume before extracting profile details." },
        { status: 400 },
      );
    }

    if (!profile.resume_pdf_key.startsWith(`${userData.user.id}/`)) {
      console.error("[resume/extract]", "Resume key does not belong to current user.");
      return NextResponse.json(
        { success: false, error: "We could not download your saved resume." },
        { status: 403 },
      );
    }

    const resumeBlob = await downloadResumeBlob(insforge, profile.resume_pdf_key);
    if (!resumeBlob) {
      return NextResponse.json(
        { success: false, error: "We could not download your saved resume." },
        { status: 500 },
      );
    }

    const resumeBuffer = Buffer.from(await resumeBlob.arrayBuffer());
    const extraction = await extractProfileFromResumeBuffer(resumeBuffer);

    if (!extraction.success) {
      return NextResponse.json(
        { success: false, error: extraction.error },
        { status: extraction.status ?? 422 },
      );
    }

    return NextResponse.json({ success: true, data: extraction.data });
  } catch (error) {
    console.error("[resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "We could not extract your resume details." },
      { status: 500 },
    );
  }
}

async function downloadResumeBlob(
  insforge: InsforgeServerClient,
  resumeKey: string,
): Promise<Blob | null> {
  const { data: resumeBlob, error: downloadError } = await insforge.storage
    .from("resumes")
    .download(resumeKey);

  if (resumeBlob && !downloadError) {
    return resumeBlob;
  }

  console.error("[resume/extract]", downloadError);

  const encodedKey = encodeURIComponent(resumeKey);
  const directUrl = new URL(
    `/api/storage/buckets/resumes/objects/${encodedKey}`,
    insforge.getHttpClient().baseUrl,
  );
  const directResponse = await insforge.getHttpClient().rawFetch(directUrl);

  if (!directResponse.ok) {
    console.error("[resume/extract]", `Direct resume download failed: ${directResponse.status}`);
    return null;
  }

  return directResponse.blob();
}
