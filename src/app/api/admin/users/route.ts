import { NextResponse } from "next/server";

export async function GET() {
  // In production, fetch real users from Prisma:
  // const users = await prisma.user.findMany({ select: { id, name, email, role, createdAt } })
  const users = [
    { id: "1", name: "Admin User", email: "admin@medi-connect.com", role: "ADMIN", createdAt: "2024-01-01" },
    { id: "2", name: "Dr. Sharma", email: "dr.sharma@apollo.com", role: "DOCTOR", createdAt: "2024-02-15" },
    { id: "3", name: "Rohan Verma", email: "rohan@example.com", role: "PATIENT", createdAt: "2024-03-10" },
  ];
  return NextResponse.json({ users });
}
