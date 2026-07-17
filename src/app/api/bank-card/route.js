import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import BankCard from '@/lib/models/BankCard';
import jwt from 'jsonwebtoken';

// 1️⃣ Helper to get current user from JWT
async function getCurrentUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();
    const user = await User.findById(payload.id);
    return user || null;
  } catch (err) {
    return null;
  }
}

// 2️⃣ GET: fetch all bank cards for the current user
export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const bankCards = await BankCard.find({ userId: user._id }).select('id accountNo bankName ifsc payeeName createdAt').lean();
    
    // map _id to id for backwards compatibility in frontend
    const mappedBankCards = bankCards.map(b => ({
      ...b,
      id: b._id.toString()
    }));

    return new Response(JSON.stringify({ banks: mappedBankCards }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}

// 3️⃣ POST: add a new bank card
export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { accountNo, bankName, ifsc, payeeName } = await req.json();
    if (!accountNo || !bankName || !ifsc || !payeeName) {
      return new Response(JSON.stringify({ message: 'All fields are required' }), { status: 400 });
    }

    // Check for duplicate account
    const existingCard = await BankCard.findOne({ userId: user._id, accountNo });

    if (existingCard) {
      return new Response(JSON.stringify({ message: 'This account is already linked.' }), { status: 400 });
    }

    const bankCard = await BankCard.create({
      userId: user._id, accountNo, bankName, ifsc, payeeName
    });

    return new Response(JSON.stringify({ message: 'Bank card added successfully!', bankCard }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}

// 4️⃣ DELETE: remove a bank card
export async function DELETE(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ message: 'Bank card ID required' }), { status: 400 });
    }

    const bankCard = await BankCard.findById(id);

    if (!bankCard || bankCard.userId.toString() !== user._id.toString()) {
      return new Response(JSON.stringify({ message: 'Bank card not found or not yours' }), { status: 404 });
    }

    await BankCard.findByIdAndDelete(id);

    return new Response(JSON.stringify({ message: 'Bank card deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
