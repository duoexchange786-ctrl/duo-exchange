import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import ModeratorLog from "@/lib/models/ModeratorLog";
import { verifyAdminCookie } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const record = await Admin.findOne({ email: admin.email });
    if (!record) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    return NextResponse.json({ 
      success: true, 
      admin: { email: record.email, id: record._id, role: record.role || 'admin' } 
    });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { currentPassword, newPassword, newEmail } = body || {};

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    await dbConnect();
    const record = await Admin.findOne({ email: admin.email });
    if (!record) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, record.password);
    if (!valid) return NextResponse.json({ error: "Invalid current password" }, { status: 401 });

    const updateData = {};

    // Moderators can only change password, not email
    if (record.role === 'moderator') {
      if (newEmail && newEmail !== record.email) {
        return NextResponse.json({ error: "Moderators cannot change their email" }, { status: 403 });
      }
      if (!newPassword) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    } else {
      // Admin can change both email and password
      if (newPassword) {
        if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
        updateData.password = await bcrypt.hash(newPassword, 10);
      }
      if (newEmail) {
        updateData.email = newEmail.trim();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await Admin.findByIdAndUpdate(record._id, updateData, { new: true });

    const changedEmail = updated.email !== record.email;

    // Log moderator password change
    if (record.role === 'moderator') {
      await ModeratorLog.create({
        moderatorId: record._id,
        moderatorEmail: record.email,
        action: 'CHANGE_PASSWORD',
        details: 'Moderator changed their password',
      });
    }

    return NextResponse.json({ success: true, admin: { email: updated.email }, emailChanged: changedEmail });
  } catch (err) {
    console.error("Error updating admin profile:", err);
    // MongoDB duplicate key error code is 11000
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
