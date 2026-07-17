import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  level: { type: Number, required: true, min: 1, max: 5 },
  commissionPercent: { type: Number, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
