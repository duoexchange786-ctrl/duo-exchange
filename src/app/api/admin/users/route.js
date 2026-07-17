// /app/api/admin/users/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Wallet from "@/lib/models/Wallet";
import BankCard from "@/lib/models/BankCard";
import Transaction from "@/lib/models/Transaction";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Block moderators from user management
    if (admin.role === 'moderator') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(5, parseInt(url.searchParams.get('pageSize') || '20')));

    const skip = (page - 1) * pageSize;

    await dbConnect();

    const [users, total] = await Promise.all([
      User.find()
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      User.countDocuments(),
    ]);

    // Fetch related data since MongoDB populate doesn't easily do limited nested collections like Prisma include does
    // For a paginated list of users, fetching related data sequentially per user is fine if pageSize is small (e.g. 20)
    for (let user of users) {
        user.wallet = await Wallet.findOne({ userId: user._id }).lean() || null;
        user.bankCards = await BankCard.find({ userId: user._id }).lean();
        user.transactions = await Transaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
    }

    return NextResponse.json({ success: true, users, page, pageSize, total });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred" },
      { status: 500 }
    );
  }
}
