export interface LeetCodeStats {
  easy: number;
  medium: number;
  hard: number;
  total: number;
  contest_rating: number;
  contest_ranking: number;
  reputation: number;
  raw_json: any;
}

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const USER_STATS_QUERY = `
  query getUserStats($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        reputation
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
    }
  }
`;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchLeetCodeStats(
  username: string,
  retries = 3
): Promise<LeetCodeStats | null> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await fetch(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
        },
        body: JSON.stringify({
          query: USER_STATS_QUERY,
          variables: { username },
        }),
        // Avoid caching on the Next.js server to get fresh data
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      const matchedUser = data.data?.matchedUser;
      if (!matchedUser) {
        // User not found
        return null;
      }

      const submissions = matchedUser.submitStats?.acSubmissionNum || [];
      const easy = submissions.find((s: any) => s.difficulty === "Easy")?.count || 0;
      const medium = submissions.find((s: any) => s.difficulty === "Medium")?.count || 0;
      const hard = submissions.find((s: any) => s.difficulty === "Hard")?.count || 0;
      const total = submissions.find((s: any) => s.difficulty === "All")?.count || (easy + medium + hard);
      
      const reputation = matchedUser.profile?.reputation || 0;

      const contest = data.data?.userContestRanking;
      const contest_rating = contest?.rating || 0;
      const contest_ranking = contest?.globalRanking || 0;

      return {
        easy,
        medium,
        hard,
        total,
        contest_rating,
        contest_ranking,
        reputation,
        raw_json: data.data,
      };
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        console.error(`Failed to fetch LeetCode stats for ${username} after ${retries} attempts:`, error);
        throw error;
      }
      // Exponential backoff
      await delay(Math.pow(2, attempt) * 1000);
    }
  }

  return null;
}
