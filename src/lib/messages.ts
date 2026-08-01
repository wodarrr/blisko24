import { supabase } from "./supabase";

export async function createConversation(
  advertisementId: number,
  sellerId: string,
  buyerId: string
) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("advertisement_id", advertisementId)
    .eq("seller_id", sellerId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      advertisement_id: advertisementId,
      seller_id: sellerId,
      buyer_id: buyerId,
    })
    .select()
    .single();

  if (error) throw error;

  return data.id;
}

export async function sendMessage(
  conversationId: number,
  senderId: string,
  message: string
) {
  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message,
    });

  if (error) throw error;
}

export async function getMessages(conversationId: number) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error) return [];

  return data ?? [];
}

export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      advertisements(
        id,
        title
      )
    `)
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
}