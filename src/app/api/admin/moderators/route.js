import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { verifyAdminCookie } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

// GET — List all moderators (admin only)
export async function GET(req) {
  try {
    const caller = verifyAdminCookie(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const callerRecord = await Admin.findOne({ email: caller.email });
    if (!callerRecord || callerRecord.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const moderators = await Admin.find({ role: 'moderator' })
      .select('email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, moderators });
  } catch (err) {
    console.error("Error fetching moderators:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — Create a new moderator (admin only)
export async function POST(req) {
  try {
    const caller = verifyAdminCookie(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const callerRecord = await Admin.findOne({ email: caller.email });
    if (!callerRecord || callerRecord.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const moderator = await Admin.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'moderator',
    });

    return NextResponse.json({
      success: true,
      moderator: { id: moderator._id, email: moderator.email, role: moderator.role },
    });
  } catch (err) {
    console.error("Error creating moderator:", err);
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — Remove a moderator (admin only)
export async function DELETE(req) {
  try {
    const caller = verifyAdminCookie(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const callerRecord = await Admin.findOne({ email: caller.email });
    if (!callerRecord || callerRecord.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const modId = searchParams.get('id');
    if (!modId) {
      return NextResponse.json({ error: "Moderator ID is required" }, { status: 400 });
    }

    const moderator = await Admin.findById(modId);
    if (!moderator || moderator.role !== 'moderator') {
      return NextResponse.json({ error: "Moderator not found" }, { status: 404 });
    }

    await Admin.findByIdAndDelete(modId);
    return NextResponse.json({ success: true, message: "Moderator deleted" });
  } catch (err) {
    console.error("Error deleting moderator:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
