import React, { useState, useEffect } from "react";
import { PropertyBrokerage } from "@/api/entities";
import { BuyersBrokerage } from "@/api/entities";
import { Meeting } from "@/api/entities";
import { ServiceCall } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Calendar, CheckSquare, Phone, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivities from "../components/dashboard/RecentActivities";
import QuickActions from "../components/dashboard/QuickActions";
import AlertsPanel from "../components/dashboard/AlertsPanel";

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [serviceCalls, setServiceCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, buyersData, meetingsData, serviceCallsData] = await Promise.all([
        PropertyBrokerage.list("-created_date", 10),
        BuyersBrokerage.list("-created_date", 10),
        Meeting.list("-start_date", 10),
        ServiceCall.list("-created_date", 10)
      ]);

      setProperties(propertiesData);
      setBuyers(buyersData);
      setMeetings(meetingsData);
      setServiceCalls(serviceCallsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const statsData = [
    {
      title: "נכסים פעילים",
      value: properties.length,
      icon: Building2,
      color: "bg-blue-500",
      change: "+12% השבוע"
    },
    {
      title: "קונים פעילים", 
      value: buyers.length,
      icon: Users,
      color: "bg-green-500",
      change: "+8% השבוע"
    },
    {
      title: "פגישות השבוע",
      value: meetings.filter(m => {
        const meetingDate = new Date(m.start_date);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return meetingDate >= now && meetingDate <= weekFromNow;
      }).length,
      icon: Calendar,
      color: "bg-purple-500",
      change: "5 השבוע"
    },
    {
      title: "קריאות שירות פתוחות",
      value: serviceCalls.filter(s => s.status !== "קריאה טופלה").length,
      icon: Phone,
      color: "bg-orange-500",
      change: serviceCalls.filter(s => s.status === "קריאה חדשה").length + " חדשות"
    }
  ];

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

        <DashboardStats stats={statsData} isLoading={isLoading} />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivities 
              properties={properties}
              buyers={buyers}
              meetings={meetings}
              serviceCalls={serviceCalls}
              isLoading={isLoading}
            />
          </div>

          <div className="space-y-6">
            <QuickActions />
            <AlertsPanel 
              serviceCalls={serviceCalls}
              urgentMeetings={meetings.filter(m => 
                new Date(m.start_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}