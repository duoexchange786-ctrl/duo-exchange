import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { NextResponse } from "next/server";

// Ensure JWT secret exists
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) console.warn("⚠️ ADMIN_JWT_SECRET is not set! Admin login will fail.");

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if admin exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 400 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role || 'admin' },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("🔥 Admin login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional GET for debugging or testing
export function GET() {
  return NextResponse.json(
    { message: "Use POST to login. This endpoint is for admins only." },
    { status: 200 }
  );
}
