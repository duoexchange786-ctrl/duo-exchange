import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  usdtAvailable: { type: Number, default: 0 },
  usdtDeposited: { type: Number, default: 0 },
  usdtWithdrawn: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
