import React, { useState, useEffect } from "react";
import { Project, ProjectLead, MarketingLead, Contact } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Target, MessageCircle, TrendingUp, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProjectsDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalProjectLeads: 0,
    totalMarketingLeads: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [projects, projectLeads, marketingLeads, contacts] = await Promise.all([
        Project.list("-created_date", 100),
        ProjectLead.list("-created_date", 50),
        MarketingLead.list("-created_date", 50),
        Contact.list()
      ]);

      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === "פתוח לדיירים").length,
        totalProjectLeads: projectLeads.length,
        totalMarketingLeads: marketingLeads.length
      });

      // יצירת רשימת פעילויות אחרונות
      const activities = [];
      
      projects.slice(0, 2).forEach(project => {
        activities.push({
          type: "project",
          title: `פרויקט חדש: ${project.name}`,
          description: `${project.city} - ${project.area}`,
          date: project.created_date,
          status: project.status
        });
      });

      projectLeads.slice(0, 3).forEach(lead => {
        const contact = contacts.find(c => c.id === lead.contact_id);
        activities.push({
          type: "lead",
          title: "ליד חדש לפרויקט",
          description: contact ? `${contact.full_name}` : "",
          date: lead.created_date,
          status: lead.status
        });
      });

      marketingLeads.slice(0, 3).forEach(lead => {
        activities.push({
          type: "marketing",
          title: "ליד חדש לדיוור",
          description: `${lead.first_name} ${lead.last_name} - ${lead.neighborhood}`,
          date: lead.created_date,
          status: lead.client_type
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

        {/* סטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-violet-500 to-violet-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100">פרויקטים</p>
                    <p className="text-3xl font-bold">{stats.totalProjects}</p>
                  </div>
                  <Building2 className="w-12 h-12 text-violet-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-rose-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100">פרויקטים פעילים</p>
                    <p className="text-3xl font-bold">{stats.activeProjects}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-rose-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">לידים לפרויקט</p>
                    <p className="text-3xl font-bold">{stats.totalProjectLeads}</p>
                  </div>
                  <Target className="w-12 h-12 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100">לידים לדיוור</p>
                    <p className="text-3xl font-bold">{stats.totalMarketingLeads}</p>
                  </div>
                  <MessageCircle className="w-12 h-12 text-teal-200" />
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

          {/* פעילות אחרונה */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  פעילות אחרונה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'project' ? 'bg-violet-100 text-violet-600' : 
                        activity.type === 'lead' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-teal-100 text-teal-600'
                      }`}>
                        {activity.type === 'project' ? 
                          <Building2 className="w-4 h-4" /> : 
                          activity.type === 'lead' ?
                          <Target className="w-4 h-4" /> :
                          <MessageCircle className="w-4 h-4" />
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