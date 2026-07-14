"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Search, ArrowUpDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export type LeaderboardUser = {
  id: string;
  name: string;
  leetcode_username: string;
  stats: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
    contest_rating: number;
    contest_ranking: number;
    reputation: number;
    updated_at: string;
  };
};

type SortField = "total" | "contest_rating" | "easy" | "medium" | "hard";

export default function LeaderboardClient({ initialData }: { initialData: LeaderboardUser[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortDesc, setSortDesc] = useState(true);

  const filteredAndSortedData = useMemo(() => {
    let data = [...initialData];

    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerSearch) ||
          u.leetcode_username.toLowerCase().includes(lowerSearch)
      );
    }

    data.sort((a, b) => {
      let valA = a.stats[sortField];
      let valB = b.stats[sortField];
      
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });

    return data;
  }, [initialData, search, sortField, sortDesc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Trophy className="w-5 h-5 text-amber-700" />;
    return <span className="font-bold text-muted-foreground w-5 text-center block">{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9 bg-background/50 backdrop-blur-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden backdrop-blur-xl bg-background/60 border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>Member</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors text-right"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center justify-end gap-1">
                  Total Solved
                  {sortField === "total" && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors text-right"
                onClick={() => handleSort("easy")}
              >
                <div className="flex items-center justify-end gap-1 text-emerald-500">
                  Easy
                  {sortField === "easy" && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors text-right"
                onClick={() => handleSort("medium")}
              >
                <div className="flex items-center justify-end gap-1 text-yellow-500">
                  Medium
                  {sortField === "medium" && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors text-right"
                onClick={() => handleSort("hard")}
              >
                <div className="flex items-center justify-end gap-1 text-red-500">
                  Hard
                  {sortField === "hard" && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary transition-colors text-right"
                onClick={() => handleSort("contest_rating")}
              >
                <div className="flex items-center justify-end gap-1">
                  Rating
                  {sortField === "contest_rating" && <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((user, index) => (
              <TableRow key={user.id} className="group transition-colors hover:bg-muted/50">
                <TableCell className="font-medium text-center">
                  <div className="flex justify-center items-center h-full">
                    {getRankIcon(index)}
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/user/${user.leetcode_username}`} className="flex items-center gap-3 w-fit group-hover/link:opacity-80">
                    <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={`https://github.com/${user.leetcode_username}.png`} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold hover:underline">{user.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        @{user.leetcode_username}
                      </span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {user.stats.total}
                </TableCell>
                <TableCell className="text-right text-emerald-500/90 font-medium">
                  {user.stats.easy}
                </TableCell>
                <TableCell className="text-right text-yellow-500/90 font-medium">
                  {user.stats.medium}
                </TableCell>
                <TableCell className="text-right text-red-500/90 font-medium">
                  {user.stats.hard}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{Math.round(user.stats.contest_rating)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredAndSortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No members found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
