import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    // Assuming deposit info comes from settings or a specific model.
    // There was no DepositInfo in Prisma schema either.
    return NextResponse.json([]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch deposit info" }, { status: 500 });
  }
}
