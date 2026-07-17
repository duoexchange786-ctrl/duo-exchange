import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import Admin from '@/lib/models/Admin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function getAdminFromCookie(req) {
  try {
    const token = req.cookies.get('adminToken')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const admin = getAdminFromCookie(req);
    if (!admin) {
      console.error('Admin auth failed - no token or invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Block moderators from accessing settings
    if (admin.role === 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const settings = await Settings.findOne() || {
      rate: "",
      withdrawMin: "",
      depositMin: "",
      trc20Address: "",
      erc20Address: "",
      trc20QrUrl: "",
      erc20QrUrl: "",
      referralLevel1: 0.1,
      referralLevel2: 0.03,
      referralLevel3: 0.02,
      referralLevel4: 0.01,
      referralLevel5: 0.01,
      moderatorAmountLimit: 500,
    };

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Admin get settings error:', err.message || err);
    return NextResponse.json({ error: 'Server error: ' + (err.message || 'Unknown') }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = getAdminFromCookie(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Block moderators from changing settings
    if (admin.role === 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { 
      rate, depositMin, withdrawMin,
      trc20Address, erc20Address,
      trc20QrUrl, erc20QrUrl,
      referralLevel1, referralLevel2, referralLevel3,
      referralLevel4, referralLevel5,
      moderatorAmountLimit
    } = body;

    console.log('Received POST payload:', body);

    // basic validation
    const r = parseFloat(rate);
    const d = parseFloat(depositMin);
    const w = parseFloat(withdrawMin);

    if (Number.isNaN(r) || Number.isNaN(d) || Number.isNaN(w)) {
      return NextResponse.json({ error: 'Invalid values' }, { status: 400 });
    }

    // Validate crypto addresses are not empty
    if (!trc20Address || !erc20Address) {
      return NextResponse.json({ error: 'Crypto addresses cannot be empty' }, { status: 400 });
    }

    await dbConnect();
    const current = await Settings.findOne();
    
    // Prepare safe data - convert all to strings and handle empty values
    const updateData = {
      rate: r,
      depositMin: d,
      withdrawMin: w,
      trc20Address: String(trc20Address || "").trim(),
      erc20Address: String(erc20Address || "").trim(),
      trc20QrUrl: String(trc20QrUrl || "").trim(),
      erc20QrUrl: String(erc20QrUrl || "").trim(),
      referralLevel1: parseFloat(referralLevel1) || 0,
      referralLevel2: parseFloat(referralLevel2) || 0,
      referralLevel3: parseFloat(referralLevel3) || 0,
      referralLevel4: parseFloat(referralLevel4) || 0,
      referralLevel5: parseFloat(referralLevel5) || 0,
      moderatorAmountLimit: parseFloat(moderatorAmountLimit) || 500,
    };

    console.log('Sending to Mongoose:', updateData);

    if (current) {
      const updated = await Settings.findByIdAndUpdate(current._id, updateData, { new: true });
      console.log('Settings updated successfully:', updated._id);
      return NextResponse.json({ settings: updated });
    } else {
      const created = await Settings.create(updateData);
      console.log('Settings created successfully:', created._id);
      return NextResponse.json({ settings: created });
    }
  } catch (err) {
    console.error('Admin set settings error:', err.message || err);
    return NextResponse.json({ error: 'Server error: ' + (err.message || 'Unknown') }, { status: 500 });
  }
}
