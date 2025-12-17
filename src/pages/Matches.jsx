import React, { useState, useEffect } from "react";
import { Matches as MatchesEntity, PropertyBrokerage, BuyersRenters, Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Target } from "lucide-react";
import { motion } from "framer-motion";

import MatchesList from "../components/matches/MatchesList";
import MatchesForm from "../components/matches/MatchesForm";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [matchesData, propertiesData, buyersData, contactsData] = await Promise.all([
        MatchesEntity.list("-created_date"),
        PropertyBrokerage.list(),
        BuyersRenters.list(),
        Contact.list()
      ]);
      setMatches(matchesData);
      setProperties(propertiesData);
      setBuyers(buyersData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterMatches = () => {
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter(match => {
        const property = properties.find(p => p.id === match.property_id);
        const buyer = buyers.find(b => b.id === match.buyer_id);
        const contact = contacts.find(c => c.id === buyer?.contact_id);
        
        return property?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               match.status?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredMatches(filtered);
  };

  const handleSubmit = async (matchData) => {
    try {
      if (editingMatch) {
        await MatchesEntity.update(editingMatch.id, matchData);
      } else {
        await MatchesEntity.create(matchData);
      }
      setShowForm(false);
      setEditingMatch(null);
      loadData();
    } catch (error) {
      console.error("Error saving match:", error);
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleDelete = async (matchId) => {
    try {
      await MatchesEntity.delete(matchId);
      loadData();
    } catch (error) {
      console.error("Error deleting match:", error);
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
              התאמות
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל ההתאמות בין נכסים לקונים</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            התאמה חדשה
          </Button>
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
                placeholder="חפש התאמות לפי עיר, שם לקוח או סטטוס..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </motion.div>

          {showForm && (
            <MatchesForm
              match={editingMatch}
              properties={properties}
              buyers={buyers}
              contacts={contacts}
              onSubmit={handleSubmit}
              onCancel={() => {
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