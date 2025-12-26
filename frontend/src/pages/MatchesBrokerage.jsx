import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { getCategoryFromURL } from "@/utils/categoryFilters";

export default function MatchesBrokeragePage() {
  const [searchParams] = useSearchParams();
  const [matches, setMatches] = useState([]);
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // קריאת פרמטר הקטגוריה מה-URL - using unified utility with React Router
  const categoryParam = getCategoryFromURL("מגורים", searchParams);

  useEffect(() => {
    loadData();
  }, [categoryParam, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("טוען נתונים...");
      
      // Use PostgREST to load matches with joined property, client, and contact data
      const postgrestFilters = {};
      
      // Search filter (will filter on joined property/buyer cities)
      if (searchTerm) {
        postgrestFilters.or = `(property.city.ilike.*${searchTerm}*,client.city.ilike.*${searchTerm}*)`;
      }
      
      // Load matches with all related data in one query
      const matchesData = await MatchesBrokerage.list(postgrestFilters, {
        select: ['*', 'property(*,contact(*))', 'client(*,contact(*))'],
        order: 'created_date.desc',
        limit: 1000
      });

      console.log("התאמות נטענו:", matchesData.length, "התאמות");

      // Filter by category using RPC function or client-side (simpler for now)
      let filteredMatches = matchesData;
      if (categoryParam) {
        // Use RPC function for category filtering
        try {
          filteredMatches = await MatchesBrokerage.rpc('filter_matches_by_category', {
            category_param: categoryParam
          });
          // Join property and client data back
          const matchIds = new Set(filteredMatches.map(m => m.id));
          filteredMatches = matchesData.filter(m => matchIds.has(m.id));
        } catch (error) {
          console.warn("RPC filter failed, using client-side filter:", error);
          // Fallback to client-side filtering
          filteredMatches = matchesData.filter(match => {
            const property = match.property;
            const client = match.client;
            if (!property || !client) return false;
            
            if (categoryParam === "מגורים") {
              return property.category === "מגורים" && 
                     ['דירה', 'בית פרטי', 'בית'].includes(client.preferred_property_type);
            } else if (categoryParam === "משרדים") {
              return property.category === "משרדים" && 
                     ['משרד', 'מסחרי'].includes(client.preferred_property_type);
            }
            return true;
          });
        }
      }

      setMatches(filteredMatches);
      setFilteredMatches(filteredMatches);
      
      // Extract properties, buyers, and contacts from joined data
      const propertiesMap = new Map();
      const buyersMap = new Map();
      const contactsMap = new Map();
      
      filteredMatches.forEach(match => {
        if (match.property) {
          propertiesMap.set(match.property.id, match.property);
          if (match.property.contact) {
            contactsMap.set(match.property.contact.id, match.property.contact);
          }
        }
        if (match.client) {
          buyersMap.set(match.client.id, match.client);
          if (match.client.contact) {
            contactsMap.set(match.client.contact.id, match.client.contact);
          }
        }
      });
      
      setProperties(Array.from(propertiesMap.values()));
      setBuyers(Array.from(buyersMap.values()));
      setContacts(Array.from(contactsMap.values()));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // פונקציה משופרת ליצירת התאמות אוטומטיות עם התראות
  const createAutomaticMatches = async () => {
    try {
      console.log("יוצר התאמות אוטומטיות עם התראות...");

      // Use PostgreSQL function via PostgREST RPC
      const result = await MatchesBrokerage.rpcPost('create_matches_from_generation', {
        category_param: categoryParam || null
      });
      
      const createdCount = result.created_count || 0;
      
      if (createdCount > 0) {
        // שליחת התראה על התאמות חדשות באמצעות הפונקציה המובנית
        await GenerateAndAlertMatches({});
        
        alert(`נוצרו ${createdCount} התאמות חדשות! נשלחה התראה למנהל המערכת.`);
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
          client_id: matchData.buyer_id || matchData.client_id 
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
              properties={properties.filter(p => !categoryParam || p.category === categoryParam)}
              buyers={buyers.filter(b => {
                if (!categoryParam) return true;
                if (categoryParam === "מגורים") {
                  return ['דירה', 'בית פרטי', 'בית'].includes(b.preferred_property_type);
                } else if (categoryParam === "משרדים") {
                  return ['משרד', 'מסחרי'].includes(b.preferred_property_type);
                }
                return true;
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