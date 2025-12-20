import React, { useState, useEffect, useCallback } from "react";
import { MatchesBrokerage } from "@/api/entities";
import { PropertyBrokerage } from "@/api/entities";
import { BuyersBrokerage } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { GenerateAndAlertMatches } from "@/api/integrations/CRMAutomation";

import MatchesList from "../components/matches/MatchesList";
import MatchesForm from "../components/matches/MatchesForm";

export default function MatchesBrokeragePage() {
  const [matches, setMatches] = useState([]);
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // קריאת פרמטר הקטגוריה מה-URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category') || 'מגורים';

  const filterMatches = useCallback(() => {
    let filtered = matches.filter(match => {
      const property = properties.find(p => p.id === match.property_id);
      const buyer = buyers.find(b => b.id === match.buyer_id);
      
      if (!property || !buyer) return false;

      // סינון לפי קטגוריה (מגורים/משרדים)
      const propertyCategoryMatch = categoryParam === "מגורים"
        ? (property.category === "פרטי" && (property.property_type === "דירה" || property.property_type === "בית פרטי"))
        : (property.category === "מסחרי" || property.property_type === "משרד");
      
      const buyerCategoryMatch = categoryParam === "מגורים"
        ? (buyer.desired_property_type === "דירה" || buyer.desired_property_type === "בית פרטי")
        : (buyer.desired_property_type === "משרד");

      // וידוא התאמה בין סוג העסקה של הנכס לבקשת הלקוח
      // נכס מכירה = לקוח קנייה, נכס השכרה = לקוח השכרה
      const transactionMatch = property.listing_type === buyer.request_category;

      return propertyCategoryMatch && buyerCategoryMatch && transactionMatch;
    });

    // סינון לפי חיפוש
    if (searchTerm) {
      filtered = filtered.filter(match => {
        const property = properties.find(p => p.id === match.property_id);
        const buyer = buyers.find(b => b.id === match.buyer_id);
        return property?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               buyer?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, categoryParam, properties, buyers]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [filterMatches]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("טוען נתונים...");
      const [matchesData, propertiesData, buyersData, contactsData] = await Promise.all([
        MatchesBrokerage.list("-created_date"),
        PropertyBrokerage.list("-created_date"),
        BuyersBrokerage.list("-created_date"),
        Contact.list("-created_date")
      ]);

      console.log("התאמות נטענו:", matchesData.length, "התאמות");
      console.log("נכסים נטענו:", propertiesData.length, "נכסים");
      console.log("לקוחות נטענו:", buyersData.length, "לקוחות");
      console.log("אנשי קשר נטענו:", contactsData.length, "אנשי קשר");

      setMatches(matchesData);
      setProperties(propertiesData);
      setBuyers(buyersData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // פונקציה משופרת ליצירת התאמות אוטומטיות עם התראות
  const createAutomaticMatches = async () => {
    try {
      console.log("יוצר התאמות אוטומטיות עם התראות...");

      const [currentProperties, currentBuyers, existingMatches] = await Promise.all([
        PropertyBrokerage.list(),
        BuyersBrokerage.list(),
        MatchesBrokerage.list()
      ]);

      const existingMatchSet = new Set(existingMatches.map(m => `${m.property_id}_${m.buyer_id}`));
      const matchesToCreate = [];

      for (const buyer of currentBuyers) {
        for (const property of currentProperties) {
          const matchKey = `${property.id}_${buyer.id}`;

          if (existingMatchSet.has(matchKey)) {
            continue;
          }

          // בדיקת התאמה בסיסית + התאמת סוג עסקה
          const areaMatch = property.area === buyer.desired_area;
          const roomsMatch = property.rooms === buyer.desired_rooms;
          const typeMatch = property.property_type === buyer.desired_property_type;
          const transactionMatch = property.listing_type === buyer.request_category;
          const budgetMatch = property.price && buyer.budget ?
            property.price <= (buyer.budget * 1.10) : false;

          if (areaMatch && roomsMatch && typeMatch && transactionMatch && budgetMatch) {
            matchesToCreate.push({
              property_id: property.id,
              buyer_id: buyer.id,
              match_score: 85,
              status: 'הותאם'
            });
            existingMatchSet.add(matchKey);
          }
        }
      }

      if (matchesToCreate.length > 0) {
        await MatchesBrokerage.bulkCreate(matchesToCreate);
        
        // שליחת התראה על התאמות חדשות באמצעות הפונקציה המובנית
        await GenerateAndAlertMatches({});
        
        alert(`נוצרו ${matchesToCreate.length} התאמות חדשות! נשלחה התראה למנהל המערכת.`);
      } else {
        alert("לא נמצאו התאמות חדשות");
      }

      loadData();

    } catch (error) {
      console.error("שגיאה ביצירת התאמות אוטומטיות:", error);
      alert("שגיאה ביצירת התאמות: " + error.message);
    }
  };

  const handleSubmit = async (matchData) => {
    try {
      console.log("שמירת התאמה:", matchData);
      
      if (editingMatch) {
        console.log("עדכון התאמה קיימת:", editingMatch.id);
        await MatchesBrokerage.update(editingMatch.id, matchData);
      } else {
        console.log("יצירת התאמה חדשה");
        const existing = await MatchesBrokerage.filter({ 
          property_id: matchData.property_id, 
          buyer_id: matchData.buyer_id 
        });

        if (existing.length > 0) {
          alert("שגיאה: התאמה זו כבר קיימת במערכת.");
          return;
        }
        await MatchesBrokerage.create(matchData);
      }
      
      setShowForm(false);
      setEditingMatch(null);
      await loadData();
      
    } catch (error) {
      console.error("Error saving match:", error);
      alert("שגיאה בשמירת ההתאמה: " + error.message);
    }
  };

  const handleEdit = (match) => {
    console.log("עריכת התאמה:", match);
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleDelete = async (matchId) => {
    try {
      console.log("מחיקת התאמה:", matchId);
      await MatchesBrokerage.delete(matchId);
      loadData();
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("שגיאה במחיקת ההתאמה: " + error.message);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              התאמות - {categoryParam}
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל ההתאמות בין נכסים ללקוחות</p>
            <p className="text-sm text-slate-500 mt-2">נמצאו {filteredMatches.length} התאמות</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={createAutomaticMatches}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Zap className="w-5 h-5 ml-2" />
              יצירת התאמות עם התראות
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              התאמה חדשה
            </Button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="חפש התאמות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </motion.div>

          {showForm && (
            <MatchesForm
              match={editingMatch}
              properties={properties.filter(p => {
                if (categoryParam === "מגורים") {
                  return p.category === "פרטי" && (p.property_type === "דירה" || p.property_type === "בית פרטי");
                } else {
                  return p.category === "מסחרי" || p.property_type === "משרד";
                }
              })}
              buyers={buyers.filter(b => {
                if (categoryParam === "מגורים") {
                  return b.desired_property_type === "דירה" || b.desired_property_type === "בית פרטי";
                } else {
                  return b.desired_property_type === "משרד";
                }
              })}
              onSubmit={handleSubmit}
              onCancel={() => {
                console.log("ביטול עריכה/יצירה");
                setShowForm(false);
                setEditingMatch(null);
              }}
            />
          )}

          <MatchesList
            matches={filteredMatches}
            properties={properties}
            buyers={buyers}
            contacts={contacts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}