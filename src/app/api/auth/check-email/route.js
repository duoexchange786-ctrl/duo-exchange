import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      // User doesn't exist yet, so they don't have an MPIN.
      return new Response(JSON.stringify({ exists: false, hasMpin: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ exists: true, hasMpin: !!user.mpin }), { status: 200 });
  } catch (error) {
    console.error('Error checking email:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
