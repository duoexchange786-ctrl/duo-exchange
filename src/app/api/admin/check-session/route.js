import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";

export async function GET(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;

    if (!token) return NextResponse.json({ valid: false }, { status: 401 });

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    await dbConnect();
    const admin = await Admin.findById(decoded.id);
    if (!admin) return NextResponse.json({ valid: false }, { status: 401 });

    return NextResponse.json({ valid: true, email: admin.email, role: admin.role || 'admin' });
  } catch (err) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
