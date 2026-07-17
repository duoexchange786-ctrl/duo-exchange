import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  fullName: { type: String, default: null },
  mobile: { type: String, default: null },
  referralCode: { type: String, unique: true, sparse: true, default: null },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
