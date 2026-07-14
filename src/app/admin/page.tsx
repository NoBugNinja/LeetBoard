import { createClient } from "@/utils/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { redirect } from "next/navigation";
import { Code2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Don't cache admin page

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // We could also check if the user.email is in the admins table here,
  // to prevent any Google user from accessing the admin dashboard.
  const { data: adminCheck } = await supabase
    .from("admins")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!adminCheck) {
    // User is logged in but not an admin
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-muted-foreground">Your email ({user.email}) is not authorized as an admin.</p>
          <form action={async () => {
            "use server";
            const s = await createClient();
            await s.auth.signOut();
            redirect("/admin/login");
          }}>
            <button type="submit" className="text-primary hover:underline">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, leetcode_username, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch users for admin:", error);
  }

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="flex items-center justify-between pb-8 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-primary/10 rounded-xl ring-1 ring-primary/25 group-hover:bg-primary/20 transition-colors">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">LeetBoard</h1>
              <p className="text-sm text-muted-foreground">Return to Leaderboard</p>
            </div>
          </Link>
        </header>

        <section>
          <AdminDashboardClient initialUsers={users || []} />
        </section>
      </main>
    </div>
  );
}
