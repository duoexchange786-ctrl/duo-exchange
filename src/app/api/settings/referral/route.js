import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';

// Public endpoint - no auth required
// Returns just the referral commission rates for the invite page
export async function GET() {
  try {
    await dbConnect();

    const settings = await Settings.findOne();
    const rates = {
      level1: settings?.referralLevel1 ?? 0.1,
      level2: settings?.referralLevel2 ?? 0.03,
      level3: settings?.referralLevel3 ?? 0.02,
      level4: settings?.referralLevel4 ?? 0.01,
      level5: settings?.referralLevel5 ?? 0.01,
    };

    return new Response(JSON.stringify({ rates }), { status: 200 });
  } catch (err) {
    console.error('Error fetching referral settings:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
