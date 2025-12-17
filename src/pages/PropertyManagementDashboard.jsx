
import React, { useState, useEffect } from "react";
import { PropertyOwner, Tenant, ServiceCall, Supplier, Contact } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, UserPlus, Phone, Wrench, TrendingUp, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PropertyManagementDashboard() {
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalTenants: 0,
    activeCalls: 0,
    totalSuppliers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [owners, tenants, serviceCalls, suppliers, contacts] = await Promise.all([
        PropertyOwner.list("-created_date", 100),
        Tenant.list("-created_date", 100),
        ServiceCall.list("-created_date", 50),
        Supplier.list(),
        Contact.list()
      ]);

      setStats({
        totalOwners: owners.length,
        totalTenants: tenants.length,
        activeCalls: serviceCalls.filter(call => call.status === "קריאה חדשה" || call.status === "בטיפול של ספק").length,
        totalSuppliers: suppliers.length
      });

      // יצירת רשימת פעילויות אחרונות
      const activities = [];
      
      serviceCalls.slice(0, 4).forEach(call => {
        const contact = contacts.find(c => c.id === call.contact_id);
        activities.push({
          type: "service",
          title: `קריאת שירות #${call.call_number}`,
          description: contact ? `לקוח: ${contact.full_name}` : "",
          date: call.created_date,
          status: call.status
        });
      });

      tenants.slice(0, 2).forEach(tenant => {
        const contact = contacts.find(c => c.id === tenant.contact_id);
        activities.push({
          type: "tenant",
          title: "דייר חדש במערכת",
          description: contact ? `${contact.full_name}` : "",
          date: tenant.created_date,
          status: tenant.status
        });
      });

      setRecentActivity(
        activities
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6)
      );

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

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

        {/* סטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">בעלי נכסים</p>
                    <p className="text-3xl font-bold">{stats.totalOwners}</p>
                  </div>
                  <Briefcase className="w-12 h-12 text-indigo-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100">דיירים</p>
                    <p className="text-3xl font-bold">{stats.totalTenants}</p>
                  </div>
                  <UserPlus className="w-12 h-12 text-cyan-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">קריאות פעילות</p>
                    <p className="text-3xl font-bold">{stats.activeCalls}</p>
                  </div>
                  <Phone className="w-12 h-12 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100">ספקים</p>
                    <p className="text-3xl font-bold">{stats.totalSuppliers}</p>
                  </div>
                  <Wrench className="w-12 h-12 text-amber-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* פעולות מהירות */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
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

          {/* פעילות אחרונה */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  פעילות אחרונה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'service' ? 'bg-red-100 text-red-600' : 'bg-cyan-100 text-cyan-600'
                      }`}>
                        {activity.type === 'service' ? 
                          <Phone className="w-4 h-4" /> : 
                          <UserPlus className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{activity.title}</h4>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(activity.date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-slate-500 text-center py-8">אין פעילות אחרונה</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* קישורים מהירים לדפים */}
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
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to={createPageUrl('PropertyOwnerManagement')}>
                  <Button className="w-full h-16 bg-indigo-600 hover:bg-indigo-700">
                    ניהול בעלי נכסים
                  </Button>
                </Link>
                <Link to={createPageUrl('Tenants')}>
                  <Button className="w-full h-16 bg-cyan-600 hover:bg-cyan-700">
                    דיירים
                  </Button>
                </Link>
                <Link to={createPageUrl('ServiceCalls')}>
                  <Button className="w-full h-16 bg-red-600 hover:bg-red-700">
                    קריאות שירות
                  </Button>
                </Link>
                <Link to={createPageUrl('Suppliers')}>
                  <Button className="w-full h-16 bg-amber-600 hover:bg-amber-700">
                    ספקים
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
