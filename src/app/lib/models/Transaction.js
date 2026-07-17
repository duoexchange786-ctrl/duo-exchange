import mongoose from 'mongoose';

delete mongoose.models.Transaction;

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  depositId: { type: String, required: true, unique: true },
  txnId: { type: String, unique: true, sparse: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USDT' },
  network: { type: String, default: null },
  address: { type: String, default: null },
  status: { type: String, default: 'PENDING' },
  description: { type: String, default: null },
  bankDetails: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
