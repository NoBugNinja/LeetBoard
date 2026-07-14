import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchLeetCodeStats } from "@/services/leetcode";
import { Database } from "@/types/database.types";

export const maxDuration = 60; // 60 seconds max execution time for Vercel Hobby
export const dynamic = "force-dynamic";

// Helper to limit concurrency
async function pMap<T, U>(
  array: T[],
  mapper: (item: T) => Promise<U>,
  concurrency: number
): Promise<U[]> {
  const results: U[] = [];
  let index = 0;

  async function worker() {
    while (index < array.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(array[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, array.length) }, worker);
  await Promise.all(workers);
  return results;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for backend updates
    );

    // 1. Fetch all users
    const { data, error: usersError } = await supabase.from("users").select("id, leetcode_username");
    const users = data as { id: string; leetcode_username: string }[] | null;

    if (usersError || !users) {
      console.error("Failed to fetch users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const isMidnight = new Date().getUTCHours() === 0;

    let successful = 0;
    let failed = 0;

    // 2. Process users with concurrency limit of 5
    await pMap(
      users,
      async (user) => {
        try {
          const stats = await fetchLeetCodeStats(user.leetcode_username);
          if (!stats) {
            console.error(`Stats not found for user: ${user.leetcode_username}`);
            failed++;
            return;
          }

          // 3. Upsert current stats
          const { error: upsertError } = await supabase.from("stats").upsert(
            {
              user_id: user.id,
              easy: stats.easy,
              medium: stats.medium,
              hard: stats.hard,
              total: stats.total,
              contest_rating: stats.contest_rating,
              contest_ranking: stats.contest_ranking,
              reputation: stats.reputation,
              raw_json: stats.raw_json,
              updated_at: new Date().toISOString(),
            } as any,
            { onConflict: "user_id" }
          );

          if (upsertError) {
            console.error(`Error upserting stats for ${user.leetcode_username}:`, upsertError);
            failed++;
            return;
          }

          // 4. If midnight UTC, insert daily history
          if (isMidnight) {
            const { error: historyError } = await supabase.from("history").insert({
              user_id: user.id,
              easy: stats.easy,
              medium: stats.medium,
              hard: stats.hard,
              total: stats.total,
              contest_rating: stats.contest_rating,
            } as any);

            if (historyError) {
              console.error(`Error inserting history for ${user.leetcode_username}:`, historyError);
            }
          }

          successful++;
        } catch (error) {
          console.error(`Error processing user ${user.leetcode_username}:`, error);
          failed++;
        }
      },
      5 // Concurrency limit
    );

    const summary = {
      message: "Update completed",
      totalUsers: users.length,
      successful,
      failed,
      isMidnight,
      timestamp: new Date().toISOString(),
    };

    console.log("Cron Update Summary:", summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
