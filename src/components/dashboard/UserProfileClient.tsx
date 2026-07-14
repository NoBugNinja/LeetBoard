"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Code, Target, Zap } from "lucide-react";
import Link from "next/link";

type HistoryData = {
  fetched_at: string;
  total: number;
  contest_rating: number;
};

type UserProfileProps = {
  user: {
    name: string;
    leetcode_username: string;
  };
  stats: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
    contest_rating: number;
    contest_ranking: number;
    reputation: number;
  };
  history: HistoryData[];
};

export default function UserProfileClient({ user, stats, history }: UserProfileProps) {
  const chartData = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime())
      .map((h) => ({
        date: new Date(h.fetched_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        total: h.total,
        rating: Math.round(h.contest_rating),
      }));
  }, [history]);

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Leaderboard
      </Link>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm backdrop-blur-xl bg-background/60">
        <Avatar className="h-24 w-24 ring-4 ring-primary/20">
          <AvatarImage src={`https://github.com/${user.leetcode_username}.png`} />
          <AvatarFallback className="text-3xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <a
            href={`https://leetcode.com/u/${user.leetcode_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-muted-foreground hover:text-primary transition-colors inline-block"
          >
            @{user.leetcode_username}
          </a>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
              <Trophy className="w-3 h-3 mr-1.5" />
              Rank {stats.contest_ranking > 0 ? stats.contest_ranking.toLocaleString() : "Unranked"}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <Code className="w-3 h-3 mr-1.5" />
              {stats.total} Solved
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Easy</CardTitle>
            <Target className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.easy}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Medium</CardTitle>
            <Target className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medium}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Hard</CardTitle>
            <Target className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hard}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Contest Rating</CardTitle>
            <Zap className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.contest_rating)}</div>
          </CardContent>
        </Card>
      </div>

      {/* History Graphs */}
      {chartData.length > 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Problems Solved Over Time</CardTitle>
              <CardDescription>Total problems completed by the user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Contest Rating Trend</CardTitle>
              <CardDescription>Fluctuation in contest rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#eab308" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle>Historical Data</CardTitle>
            <CardDescription>Not enough data points yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center text-muted-foreground border border-dashed rounded-lg border-border/50">
              Come back tomorrow after the next scheduled snapshot to see graphs!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
