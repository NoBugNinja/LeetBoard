import { createClient } from "@/utils/supabase/server";
import LeaderboardClient, { LeaderboardUser } from "@/components/dashboard/LeaderboardClient";
import { Code2 } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
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
        reputation,
        updated_at
      )
    `);

  let initialData: LeaderboardUser[] = [];

  if (data && !error) {
    initialData = data.map((u: any) => ({
      id: u.id,
      name: u.name,
      leetcode_username: u.leetcode_username,
      stats: Array.isArray(u.stats) ? u.stats[0] : u.stats, // Inner join returns an array or single object depending on relation
    }));
  } else if (error) {
    console.error("Failed to fetch leaderboard data:", error);
  }

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="flex items-center justify-between pb-8 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/25">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">LeetBoard</h1>
              <p className="text-sm text-muted-foreground">Private Coding Club</p>
            </div>
          </div>
          
          {/* We can add a link to Admin dashboard or profile here */}
          <a 
            href="/admin" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Access &rarr;
          </a>
        </header>

        <section>
          <LeaderboardClient initialData={initialData} />
        </section>
      </main>
    </div>
  );
}
