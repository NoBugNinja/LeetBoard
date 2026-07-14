import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import UserProfileClient from "@/components/dashboard/UserProfileClient";

export const revalidate = 60;

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select(`
      id,
      name,
      leetcode_username,
      stats!inner (
        easy,
        medium,
        hard,
        total,
        contest_rating,
        contest_ranking,
        reputation
      )
    `)
    .eq("leetcode_username", username)
    .single();

  if (userError || !user) {
    notFound();
  }

  const { data: historyData, error: historyError } = await supabase
    .from("history")
    .select("fetched_at, total, contest_rating")
    .eq("user_id", user.id)
    .order("fetched_at", { ascending: true });

  const stats = Array.isArray(user.stats) ? user.stats[0] : user.stats;

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <UserProfileClient 
          user={{
            name: user.name,
            leetcode_username: user.leetcode_username,
          }}
          stats={stats}
          history={historyData || []}
        />
      </main>
    </div>
  );
}
