import { NextResponse } from "next/server";

export async function GET() {
  // In production, fetch from Prisma: prisma.healthRecord.findMany(...)
  const records = [
    { id: "1", title: "Discharge Summary", description: "Post surgery", date: "2024-09-22", patientId: "3" },
    { id: "2", title: "Lab Report — CBC", description: "Complete blood count", date: "2024-03-02", patientId: "3" },
    { id: "3", title: "Prescription", description: "Hypertension medication", date: "2024-01-14", patientId: "3" },
  ];
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, patientId } = body;

  if (!title || !patientId) {
    return NextResponse.json({ error: "title and patientId are required" }, { status: 400 });
  }

  // In production: await prisma.healthRecord.create({ data: { title, description, patientId } })
  const newRecord = { id: Date.now().toString(), title, description, date: new Date().toISOString(), patientId };
  return NextResponse.json({ record: newRecord }, { status: 201 });
}
