import { verifyAdminToken } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const decoded = verifyAdminToken(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const admin = await Admin.findById(decoded.id);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    console.error("Admin me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
