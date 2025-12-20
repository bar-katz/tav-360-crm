import React from "react";
import { Building2, Users, Calendar, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboardStats";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import QuickActions from "../components/dashboard/QuickActions";
import AlertsPanel from "../components/dashboard/AlertsPanel";

export default function Dashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats("main");
  const { activities, isLoading: activitiesLoading } = useRecentActivity(8);

  const statsData = stats ? [
    {
      title: "נכסים פעילים",
      value: stats.properties?.total || 0,
      icon: Building2,
      color: "bg-blue-500",
      change: stats.properties?.change || "0%"
    },
    {
      title: "קונים פעילים",
      value: stats.buyers?.total || 0,
      icon: Users,
      color: "bg-green-500",
      change: stats.buyers?.change || "0%"
    },
    {
      title: "פגישות השבוע",
      value: stats.meetings?.this_week || 0,
      icon: Calendar,
      color: "bg-purple-500",
      change: stats.meetings?.change || "0 השבוע"
    },
    {
      title: "קריאות שירות פתוחות",
      value: stats.service_calls?.open || 0,
      icon: Phone,
      color: "bg-orange-500",
      change: stats.service_calls?.change || "0 חדשות"
    }
  ] : [];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">דשבורד ראשי</h1>
          <p className="text-slate-600">סקירה כללית של פעילות המערכת</p>
        </motion.div>

        <StatsGrid stats={statsData} isLoading={statsLoading} />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivityList activities={activities} isLoading={activitiesLoading} />
          </div>

          <div className="space-y-6">
            <QuickActions />
            <AlertsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

