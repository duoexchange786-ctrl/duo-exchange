import mongoose from 'mongoose';

const BankCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNo: { type: String, required: true },
  bankName: { type: String, required: true },
  ifsc: { type: String, required: true },
  payeeName: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
}, { timestamps: true });

BankCardSchema.index({ userId: 1, accountNo: 1 }, { unique: true });

export default mongoose.models.BankCard || mongoose.model('BankCard', BankCardSchema);
