import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Target, MessageCircle, Home, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import StatsGrid from "@/components/dashboard/StatsGrid";

export default function BrokerageDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { stats: residentialStats, isLoading: residentialLoading } = useDashboardStats("brokerage", { category: "מגורים" });
  const { stats: commercialStats, isLoading: commercialLoading } = useDashboardStats("brokerage", { category: "משרדים" });

  const QuickActionCard = ({ title, icon: Icon, color, link, category }: any) => (
    <Link to={`${link}?category=${category}`}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-6 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${color} bg-opacity-10 flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );

  const CategoryDashboard = ({ category, stats, isLoading }: { category: string; stats: any; isLoading: boolean }) => {
    const statsData = stats ? [
      {
        title: "נכסים",
        value: stats.properties || 0,
        icon: Building2,
        color: "bg-blue-500",
      },
      {
        title: "לקוחות",
        value: stats.buyers || 0,
        icon: Users,
        color: "bg-green-500",
      },
      {
        title: "התאמות",
        value: stats.matches || 0,
        icon: Target,
        color: "bg-purple-500",
      },
      {
        title: "לידים לדיוור",
        value: stats.marketing_leads || 0,
        icon: MessageCircle,
        color: "bg-orange-500",
      }
    ] : [];

    return (
      <div className="space-y-6">
        <StatsGrid stats={statsData} isLoading={isLoading} />

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">גישה מהירה</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="נכסים"
              icon={Building2}
              color="bg-blue-600"
              link={createPageUrl('PropertyBrokerage')}
              category={category}
            />
            <QuickActionCard
              title="לקוחות"
              icon={Users}
              color="bg-green-600"
              link={createPageUrl('BuyersBrokerage')}
              category={category}
            />
            <QuickActionCard
              title="התאמות"
              icon={Target}
              color="bg-purple-600"
              link={createPageUrl('MatchesBrokerage')}
              category={category}
            />
            <Link to={createPageUrl('MarketingLeads')}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-600 bg-opacity-10 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">לידים לדיוור</h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            דשבורד תיווך
          </h1>
          <p className="text-slate-600">ניהול נכסים, לקוחות והתאמות לתיווך</p>
        </motion.div>

        <Tabs defaultValue="residential" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="residential" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              מגורים
            </TabsTrigger>
            <TabsTrigger value="commercial" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              משרדים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="residential">
            <CategoryDashboard category="מגורים" stats={residentialStats} isLoading={residentialLoading} />
          </TabsContent>

          <TabsContent value="commercial">
            <CategoryDashboard category="משרדים" stats={commercialStats} isLoading={commercialLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

