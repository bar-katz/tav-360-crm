import React, { useState, useEffect } from "react";
import { PropertyBrokerage } from "@/api/entities";
import { BuyersBrokerage } from "@/api/entities";
import { MatchesBrokerage } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, MessageCircle, TrendingUp, Home, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BrokerageDashboard() {
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, buyersData, matchesData, contactsData] = await Promise.all([
        PropertyBrokerage.list("-created_date"),
        BuyersBrokerage.list("-created_date"),
        MatchesBrokerage.list("-created_date"),
        Contact.list()
      ]);

      setProperties(propertiesData);
      setBuyers(buyersData);
      setMatches(matchesData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // פונקציה לקבלת נתונים מסוננים לפי קטגוריה
  const getFilteredData = (category) => {
    const filteredProperties = properties.filter(p => {
      return category === "מגורים" 
        ? (p.category === "פרטי" && (p.property_type === "דירה" || p.property_type === "בית פרטי"))
        : (p.category === "מסחרי" || p.property_type === "משרד");
    });

    const filteredBuyers = buyers.filter(b => {
      return category === "מגורים"
        ? (b.desired_property_type === "דירה" || b.desired_property_type === "בית פרטי")
        : (b.desired_property_type === "משרד");
    });

    const filteredMatches = matches.filter(match => {
      const property = properties.find(p => p.id === match.property_id);
      const buyer = buyers.find(b => b.id === match.buyer_id);
      
      if (!property || !buyer) return false;

      const propertyCategoryMatch = category === "מגורים"
        ? (property.category === "פרטי" && (property.property_type === "דירה" || property.property_type === "בית פרטי"))
        : (property.category === "מסחרי" || property.property_type === "משרד");
      
      const buyerCategoryMatch = category === "מגורים"
        ? (buyer.desired_property_type === "דירה" || buyer.desired_property_type === "בית פרטי")
        : (buyer.desired_property_type === "משרד");

      return propertyCategoryMatch && buyerCategoryMatch;
    });

    return {
      properties: filteredProperties,
      buyers: filteredBuyers,
      matches: filteredMatches
    };
  };

  const QuickActionCard = ({ title, icon: Icon, color, link, category }) => (
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

  const CategoryDashboard = ({ category }) => {
    const data = getFilteredData(category);

    return (
      <div className="space-y-6">
        {/* סטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">נכסים</p>
                  <p className="text-3xl font-bold">{data.properties.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">לקוחות</p>
                  <p className="text-3xl font-bold">{data.buyers.length}</p>
                </div>
                <Users className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">התאמות</p>
                  <p className="text-3xl font-bold">{data.matches.length}</p>
                </div>
                <Target className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Link to={createPageUrl('MarketingLeads')}>
            <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">לידים לדיוור</p>
                    <p className="text-3xl font-bold">...</p>
                  </div>
                  <MessageCircle className="w-12 h-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* פעולות מהירות */}
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

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">טוען נתונים...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <CategoryDashboard category="מגורים" />
          </TabsContent>

          <TabsContent value="commercial">
            <CategoryDashboard category="משרדים" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}