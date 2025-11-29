
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, PenLine, Plus, Scale, StickyNote, CheckCircle2 } from "lucide-react"
import { Clock } from "@/components/Clock"
import { Greeting } from "@/components/Greeting"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { TaskWidget } from "@/components/home/TaskWidget"
import { RecentActivityList } from "@/components/home/RecentActivityList"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const today = format(new Date(), "EEEE") // e.g., "Monday"
  const todaysTasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      day: today
    }
  })

  const completedTasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED"
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5
  })

  return (
    <div className="relative min-h-full flex flex-col justify-center py-8 overflow-hidden">
      <div className="w-full space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center md:text-left">
          <Greeting name={session.user?.name} />
          <Clock />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/diary" className="group">
            <div className="glass-card h-32 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 p-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <PenLine className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">New Entry</span>
            </div>
          </Link>

          <Link href="/fitness" className="group">
            <div className="glass-card h-32 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 p-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                <Scale className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Log Weight</span>
            </div>
          </Link>

          <Link href="/planning" className="group">
            <div className="glass-card h-32 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 p-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Add Task</span>
            </div>
          </Link>

          <Link href="/dashboard" className="group">
            <div className="glass-card h-32 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 p-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                <StickyNote className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Quick Note</span>
            </div>
          </Link>
        </div>

        {/* Widgets Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-0 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-light">
                <Activity className="h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivityList tasks={completedTasks} />
            </CardContent>
          </Card>

          <TaskWidget initialTasks={todaysTasks} today={today} />
        </div>
      </div>
    </div>
  )
}
