// Abonnement Bâtiplace Illimité via l'App Store / Google Play (RevenueCat).
// Le webhook RevenueCat (supabase/functions/revenuecat-webhook) met à jour la
// table `subscriptions`, qui débloque aussi le site Web pour le même compte.
import { Platform } from 'react-native';
import Purchases, { PURCHASES_ERROR_CODE, type PurchasesPackage } from 'react-native-purchases';

export const ENTITLEMENT_ID = 'illimite';

const apiKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

let configured = false;

function ensureConfigured() {
  if (configured || !apiKey) return configured;
  Purchases.configure({ apiKey });
  configured = true;
  return true;
}

export const purchasesAvailable = Boolean(apiKey);

/** Links the store account to the Supabase user so the webhook knows who paid. */
export async function identifyPurchaser(userId: string | null) {
  if (!ensureConfigured()) return;
  try {
    if (userId) await Purchases.logIn(userId);
    else if (!(await Purchases.isAnonymous())) await Purchases.logOut();
  } catch {
    // The store being unreachable must never block sign-in.
  }
}

export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  if (!ensureConfigured()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current?.monthly ?? offerings.current?.availablePackages[0] ?? null;
}

export type PurchaseOutcome = 'subscribed' | 'cancelled' | 'unavailable';

export async function buySubscription(): Promise<PurchaseOutcome> {
  const pkg = await getMonthlyPackage();
  if (!pkg) return 'unavailable';
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] ? 'subscribed' : 'cancelled';
  } catch (e) {
    if ((e as { code?: string }).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    throw e;
  }
}

export async function restorePurchases() {
  if (!ensureConfigured()) return false;
  const info = await Purchases.restorePurchases();
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
}

export const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
