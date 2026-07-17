import dbConnect from './db';
import User from './models/User';
import Wallet from './models/Wallet';
import Settings from './models/Settings';
import Referral from './models/Referral';

/**
 * Distribute referral commissions up the referral chain (up to 5 levels).
 * Called when a deposit or sell transaction is confirmed by admin.
 *
 * @param {string} userId - The user whose transaction was confirmed
 * @param {string} transactionId - The confirmed transaction's _id
 * @param {number} amount - The transaction amount in USDT
 */
export async function distributeReferralCommission(userId, transactionId, amount) {
  try {
    await dbConnect();

    // Fetch commission rates from settings
    const settings = await Settings.findOne();
    if (!settings) return;

    const rates = [
      settings.referralLevel1 || 0,
      settings.referralLevel2 || 0,
      settings.referralLevel3 || 0,
      settings.referralLevel4 || 0,
      settings.referralLevel5 || 0,
    ];

    // Walk up the referral chain
    let currentUserId = userId;

    for (let level = 0; level < 5; level++) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser || !currentUser.referredBy) break;

      const referrerId = currentUser.referredBy;
      const commissionPercent = rates[level];

      if (commissionPercent <= 0) {
        currentUserId = referrerId;
        continue;
      }

      const commissionAmount = parseFloat((amount * (commissionPercent / 100)).toFixed(6));

      if (commissionAmount <= 0) {
        currentUserId = referrerId;
        continue;
      }

      // Credit referrer's wallet
      await Wallet.findOneAndUpdate(
        { userId: referrerId },
        { $inc: { usdtAvailable: commissionAmount } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Log the referral commission
      await Referral.create({
        userId: referrerId,
        fromUserId: userId,
        transactionId,
        level: level + 1,
        commissionPercent,
        amount: commissionAmount,
      });

      console.log(
        `Referral commission: Level ${level + 1}, ${commissionPercent}% of ${amount} = ${commissionAmount} USDT credited to user ${referrerId}`
      );

      // Move up the chain
      currentUserId = referrerId;
    }
  } catch (err) {
    console.error('Error distributing referral commissions:', err);
    // Don't throw — commission errors should not break the main transaction flow
  }
}
