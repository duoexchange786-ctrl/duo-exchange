import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import ModeratorLog from "@/lib/models/ModeratorLog";
import { verifyAdminCookie } from "@/lib/adminAuth";

// GET — Fetch paginated moderator action logs (admin only)
export async function GET(req) {
  try {
    const caller = verifyAdminCookie(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const callerRecord = await Admin.findOne({ email: caller.email });
    if (!callerRecord || callerRecord.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '30');
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      ModeratorLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ModeratorLog.countDocuments()
    ]);

    return NextResponse.json({ success: true, logs, total, page, pageSize });
  } catch (err) {
    console.error("Error fetching moderator logs:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
