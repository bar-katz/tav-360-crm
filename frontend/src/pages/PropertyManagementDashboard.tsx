import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, UserPlus, Phone, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboardStats";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentActivityList from "@/components/dashboard/RecentActivityList";

export default function PropertyManagementDashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats("property-management");
  const { activities, isLoading: activitiesLoading } = useRecentActivity(6);

  const statsData = stats ? [
    {
      title: "בעלי נכסים",
      value: stats.total_owners || 0,
      icon: Briefcase,
      color: "bg-indigo-500",
    },
    {
      title: "דיירים",
      value: stats.total_tenants || 0,
      icon: UserPlus,
      color: "bg-cyan-500",
    },
    {
      title: "קריאות שירות פעילות",
      value: stats.active_calls || 0,
      icon: Phone,
      color: "bg-red-500",
    },
    {
      title: "ספקים",
      value: stats.total_suppliers || 0,
      icon: Wrench,
      color: "bg-orange-500",
    }
  ] : [];

  const quickActions = [
    {
      title: "בעל נכס חדש",
      description: "הוסף בעל נכס חדש למערכת",
      icon: Briefcase,
      link: createPageUrl('PropertyOwners'),
      color: "bg-indigo-600"
    },
    {
      title: "דייר חדש",
      description: "רשום דייר חדש במערכת",
      icon: UserPlus,
      link: createPageUrl('Tenants'),
      color: "bg-cyan-600"
    },
    {
      title: "קריאת שירות",
      description: "פתח קריאת שירות חדשה",
      icon: Phone,
      link: createPageUrl('ServiceCalls'),
      color: "bg-red-600"
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-green-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-green-600" />
            דשבורד ניהול נכסים
          </h1>
          <p className="text-slate-600 mt-1">מבט כולל על פעילות ניהול הנכסים</p>
        </motion.div>

        <StatsGrid stats={statsData} isLoading={statsLoading} />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  פעולות מהירות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} to={action.link}>
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{action.title}</h3>
                          <p className="text-sm text-slate-600">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <RecentActivityList activities={activities} isLoading={activitiesLoading} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

