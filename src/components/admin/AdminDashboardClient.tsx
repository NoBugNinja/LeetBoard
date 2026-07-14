"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addMember, removeMember, editMember, triggerManualRefresh } from "@/app/admin/actions";
import { toast } from "sonner";
import { Trash2, Edit2, RefreshCcw, Plus, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  leetcode_username: string;
  created_at: string;
};

export default function AdminDashboardClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberUsername) return;
    const res = await addMember(newMemberName, newMemberUsername);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Member added successfully");
      setIsAddOpen(false);
      setNewMemberName("");
      setNewMemberUsername("");
      // Refresh local state ideally, but revalidatePath will handle it on next refresh.
      // For immediate UX, we can just push a fake user or reload.
      router.refresh();
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    const res = await removeMember(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Member removed");
      router.refresh();
    }
  };

  const handleEditMember = async () => {
    if (!editUserId || !editUsername) return;
    const res = await editMember(editUserId, editUsername);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Username updated");
      setEditUserId(null);
      setEditUsername("");
      router.refresh();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Starting manual refresh...");
    const res = await triggerManualRefresh();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Refresh complete. ${res.summary.successful} updated, ${res.summary.failed} failed.`);
    }
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Force Refresh
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Members</CardTitle>
            <CardDescription>Add, edit, or remove members from the club leaderboard.</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>Enter the member's name and exact LeetCode username.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input 
                    value={newMemberName} 
                    onChange={(e) => setNewMemberName(e.target.value)} 
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LeetCode Username</label>
                  <Input 
                    value={newMemberUsername} 
                    onChange={(e) => setNewMemberUsername(e.target.value)} 
                    placeholder="e.g. john_doe_123"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMember}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>LeetCode Username</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>
                    {editUserId === u.id ? (
                      <Input 
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="max-w-[200px] h-8"
                      />
                    ) : (
                      u.leetcode_username
                    )}
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {editUserId === u.id ? (
                      <>
                        <Button size="sm" onClick={handleEditMember}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditUserId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => {
                          setEditUserId(u.id);
                          setEditUsername(u.leetcode_username);
                        }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleRemoveMember(u.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {initialUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No members found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
