import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import Settings from "@/lib/models/Settings";
import ModeratorLog from "@/lib/models/ModeratorLog";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { transactionId, reason } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    await dbConnect();
    const tx = await Transaction.findById(transactionId);

    if (!tx || tx.status !== "PENDING") {
      return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
    }

    // Moderator amount guard
    if (admin.role === 'moderator') {
      const settings = await Settings.findOne().lean();
      const limit = settings?.moderatorAmountLimit || 500;
      if (tx.amount > limit) {
        return NextResponse.json({ error: "You don't have permission to reject this amount" }, { status: 403 });
      }
    }

    tx.status = "FAILED";
    if (reason) tx.description = reason;
    await tx.save();

    // Log moderator action
    if (admin.role === 'moderator') {
      await ModeratorLog.create({
        moderatorId: admin.id,
        moderatorEmail: admin.email,
        action: 'REJECT_DEPOSIT',
        targetId: transactionId,
        details: `Rejected deposit of $${tx.amount} USDT. Reason: ${reason || 'N/A'}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin reject error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
