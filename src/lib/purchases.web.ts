// Sur le Web, l'abonnement s'achète dans l'application mobile ; le site lit
// seulement l'état de l'abonnement dans Supabase.
export const ENTITLEMENT_ID = 'illimite';
export const purchasesAvailable = false;
export const storeName = 'App Store ou Google Play';

export type PurchaseOutcome = 'subscribed' | 'cancelled' | 'unavailable';

export async function identifyPurchaser(_userId: string | null) {}
export async function getMonthlyPackage() {
  return null;
}
export async function buySubscription(): Promise<PurchaseOutcome> {
  return 'unavailable';
}
export async function restorePurchases() {
  return false;
}
