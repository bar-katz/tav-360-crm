import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Target, MessageCircle, TrendingUp, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useDashboardStats, useRecentActivity } from "@/hooks/useDashboardStats";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentActivityList from "@/components/dashboard/RecentActivityList";

export default function ProjectsDashboard() {
  const { stats, isLoading: statsLoading } = useDashboardStats("projects");
  const { activities, isLoading: activitiesLoading } = useRecentActivity(6);

  const statsData = stats ? [
    {
      title: "פרויקטים",
      value: stats.total_projects || 0,
      icon: Building2,
      color: "bg-violet-500",
    },
    {
      title: "פרויקטים פעילים",
      value: stats.active_projects || 0,
      icon: TrendingUp,
      color: "bg-rose-500",
    },
    {
      title: "לידים לפרויקט",
      value: stats.total_project_leads || 0,
      icon: Target,
      color: "bg-emerald-500",
    },
    {
      title: "לידים לדיוור",
      value: stats.total_marketing_leads || 0,
      icon: MessageCircle,
      color: "bg-teal-500",
    }
  ] : [];

  const quickActions = [
    {
      title: "פרויקט חדש",
      description: "הוסף פרויקט חדש למערכת",
      icon: Building2,
      link: createPageUrl('Projects'),
      color: "bg-violet-600"
    },
    {
      title: "ליד לפרויקט",
      description: "רשום מתעניין חדש לפרויקט",
      icon: Target,
      link: createPageUrl('ProjectLeads'),
      color: "bg-rose-600"
    },
    {
      title: "ליד לדיוור",
      description: "הוסף ליד חדש לדיוור",
      icon: MessageCircle,
      link: createPageUrl('MarketingLeads'),
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-600" />
            דשבורד פרויקטים
          </h1>
          <p className="text-slate-600 mt-1">מבט כולל על פעילות הפרויקטים והמרקטינג</p>
        </motion.div>

        <StatsGrid stats={statsData} isLoading={statsLoading} />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>גישה מהירה לכל הדפים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to={createPageUrl('Projects')}>
                  <Button className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-lg">
                    פרויקטים
                  </Button>
                </Link>
                <Link to={createPageUrl('ProjectLeads')}>
                  <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-lg">
                    לידים לפרויקט
                  </Button>
                </Link>
                <Link to={createPageUrl('MarketingLeads')}>
                  <Button className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-lg">
                    לידים לדיוור
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

