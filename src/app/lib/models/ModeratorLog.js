import mongoose from 'mongoose';

const ModeratorLogSchema = new mongoose.Schema({
  moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  moderatorEmail: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'CONFIRM_DEPOSIT', 'REJECT_DEPOSIT',
      'CONFIRM_WITHDRAWAL', 'REJECT_WITHDRAWAL',
      'CHANGE_PASSWORD', 'LOGIN'
    ]
  },
  targetId: { type: String, default: null },
  details: { type: String, default: '' },
}, { timestamps: true });

ModeratorLogSchema.index({ createdAt: -1 });
ModeratorLogSchema.index({ moderatorId: 1 });

export default mongoose.models.ModeratorLog || mongoose.model('ModeratorLog', ModeratorLogSchema);
