import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, network, depositId, txid, address } = body;

    if (!amount || !depositId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const transaction = await Transaction.create({
      userId: user._id,
      depositId,
      txnId: txid || null,
      type: "DEPOSIT",
      amount: Number(amount),
      network,
      address,
      status: "PENDING",
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err) {
    console.error("Deposit error:", err);
    if (err.code === 11000) {
      if (err.keyPattern?.txnId) {
        return NextResponse.json({ error: "Transaction ID already used" }, { status: 400 });
      }
      if (err.keyPattern?.depositId) {
        return NextResponse.json({ error: "Deposit request already submitted" }, { status: 400 });
      }
      return NextResponse.json({ error: "Duplicate entry" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
