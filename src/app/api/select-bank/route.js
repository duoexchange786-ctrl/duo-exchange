import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
// import Bank from "@/lib/models/Bank"; // Assuming Bank model would exist if it was in schema. It was missing from schema.prisma too.

export async function POST(req) {
  try {
    const { userId, bankId } = await req.json();

    await dbConnect();

    // The Prisma schema didn't have a Bank model, and we don't have one now.
    // If Bank model exists:
    // const bank = await Bank.findById(bankId);
    // if (!bank) {
    //   return new Response(JSON.stringify({ message: "Bank not found" }), { status: 404 });
    // }

    // Save selected bank for user (example: update user table)
    await User.findByIdAndUpdate(userId, { selectedBankId: bankId });

    return new Response(JSON.stringify({ message: "Bank selected" }), { status: 200 });
  } catch (error) {
    console.error("Error selecting bank:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
