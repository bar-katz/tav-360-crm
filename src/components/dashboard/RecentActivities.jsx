import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Calendar, CheckSquare, Clock } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const statusColors = {
  "נכס חדש": "bg-blue-100 text-blue-800",
  "קונה חדש": "bg-green-100 text-green-800", 
  "נקבעה": "bg-purple-100 text-purple-800",
  "חדשה": "bg-orange-100 text-orange-800",
  "גבוהה": "bg-red-100 text-red-800",
  "בינונית": "bg-yellow-100 text-yellow-800"
};

export default function RecentActivities({ properties = [], buyers = [], meetings = [], serviceCalls = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Clock className="w-5 h-5 text-blue-600" />
            פעילות אחרונה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // בדיקה שכל המערכים קיימים לפני שמנסים לגשת אליהם
  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeBuyers = Array.isArray(buyers) ? buyers : [];
  const safeMeetings = Array.isArray(meetings) ? meetings : [];
  const safeServiceCalls = Array.isArray(serviceCalls) ? serviceCalls : [];

  const allActivities = [
    ...safeProperties.slice(0, 3).map(p => ({
      type: 'property',
      icon: Building2,
      title: `נכס חדש: ${p.property_type || 'לא מוגדר'} ב${p.city || 'לא מוגדר'}`,
      subtitle: `${p.rooms || 0} חדרים • ${p.price ? p.price.toLocaleString() : '0'} ₪`,
      status: p.status || 'נכס חדש',
      time: p.created_date,
      id: p.id
    })),
    ...safeBuyers.slice(0, 3).map(c => ({
      type: 'buyer',
      icon: Users,
      title: `קונה חדש מעוניין`,
      subtitle: `${c.desired_property_type || 'לא מוגדר'} • תקציב: ${c.budget ? c.budget.toLocaleString() : '0'} ₪`,
      status: c.status || 'קונה חדש',
      time: c.created_date,
      id: c.id
    })),
    ...safeMeetings.slice(0, 3).map(m => ({
      type: 'meeting',
      icon: Calendar,
      title: `פגישה: ${m.meeting_type || 'לא מוגדר'}`,
      subtitle: m.start_date ? format(new Date(m.start_date), 'dd/MM/yyyy HH:mm', { locale: he }) : 'תאריך לא מוגדר',
      status: m.status || 'נקבעה',
      time: m.created_date,
      id: m.id
    })),
    ...safeServiceCalls.slice(0, 3).map(s => ({
      type: 'service',
      icon: CheckSquare,
      title: `קריאת שירות #${s.call_number || s.id?.slice(-4) || 'לא ידוע'}`,
      subtitle: s.description ? s.description.substring(0, 50) + (s.description.length > 50 ? '...' : '') : 'אין תיאור',
      status: s.status || 'חדשה',
      time: s.created_date,
      id: s.id
    }))
  ].filter(activity => activity.time) // רק פעילויות עם תאריך
   .sort((a, b) => new Date(b.time) - new Date(a.time))
   .slice(0, 8);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Clock className="w-5 h-5 text-blue-600" />
          פעילות אחרונה
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">אין פעילות אחרונה</p>
            <p className="text-sm text-slate-400">פעילויות חדשות יופיעו כאן</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {allActivities.map((activity, index) => (
                <motion.div
                  key={`${activity.type}-${activity.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <activity.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{activity.title}</p>
                    <p className="text-sm text-slate-500 truncate">{activity.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${statusColors[activity.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {activity.time ? format(new Date(activity.time), 'dd/MM', { locale: he }) : ''}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}