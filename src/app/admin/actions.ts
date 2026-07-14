"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMember(name: string, leetcodeUsername: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("users").insert({
    name,
    leetcode_username: leetcodeUsername,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function removeMember(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function editMember(userId: string, newUsername: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("users").update({
    leetcode_username: newUsername,
  }).eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function triggerManualRefresh() {
  // In a real scenario with Vercel Cron, you might just fetch the API route
  // Here we can just call our own API route locally
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/update`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET || ''}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`Refresh failed: ${res.status}`);
    }
    
    const summary = await res.json();
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, summary };
  } catch (error: any) {
    return { error: error.message || "Failed to trigger refresh" };
  }
}
