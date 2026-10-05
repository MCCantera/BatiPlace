export type ConversationRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listing: { id: string; title: string } | null;
  buyer: { display_name: string } | null;
  seller: { display_name: string } | null;
};

export const CONVERSATION_SELECT =
  'id, buyer_id, seller_id, last_message_at, listing:listings(id, title), buyer:profiles!conversations_buyer_id_fkey(display_name), seller:profiles!conversations_seller_id_fkey(display_name)';
