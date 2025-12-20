
import React, { useState, useEffect } from "react";
import { MarketingLead, MarketingLog } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, MessageCircle, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";
import { subDays } from 'date-fns';

import MarketingLeadsList from "../components/marketing/MarketingLeadsList";
import MarketingFilters from "../components/marketing/MarketingFilters";
import ExcelImport from "../components/marketing/ExcelImport";
import WhatsAppSender from "../components/marketing/WhatsAppSender";

export default function MarketingLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [showSender, setShowSender] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [filters, setFilters] = useState({
    client_type: "all",
    neighborhood: "all",
    budget_range: "all",
    opt_out: "all",
    seriousness: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, filters, quickFilter]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const leadsData = await MarketingLead.list("-created_date");
      setLeads(leadsData);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    setIsLoading(false);
  };

  const filterLeads = () => {
    let filtered = leads;

    // 1. Quick Filters
    if (quickFilter !== 'all') {
      const today = new Date();
      if (quickFilter === '7days') {
        const sevenDaysAgo = subDays(today, 7);
        filtered = filtered.filter(lead => lead.last_contacted && new Date(lead.last_contacted) >= sevenDaysAgo);
      } else if (quickFilter === '30days') {
        const thirtyDaysAgo = subDays(today, 30);
        filtered = filtered.filter(lead => lead.last_contacted && new Date(lead.last_contacted) >= thirtyDaysAgo);
      } else if (quickFilter === 'never') {
        filtered = filtered.filter(lead => !lead.last_contacted);
      }
    }
    
    // 2. Search Term
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone_number?.includes(searchTerm) ||
        lead.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 3. Advanced Filters
    if (filters.client_type !== "all") {
      filtered = filtered.filter(lead => lead.client_type === filters.client_type);
    }

    if (filters.neighborhood !== "all") {
      filtered = filtered.filter(lead => lead.neighborhood === filters.neighborhood);
    }

    if (filters.opt_out !== "all") {
       const optOutValue = filters.opt_out === "כן";
       filtered = filtered.filter(lead => (lead.opt_out_whatsapp === "כן") === optOutValue);
    }

    if (filters.seriousness !== "all") {
      filtered = filtered.filter(lead => lead.seriousness === filters.seriousness);
    }

    setFilteredLeads(filtered);
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    loadLeads();
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const eligibleLeads = filteredLeads
        .filter(lead => lead.opt_out_whatsapp !== "כן")
        .map(lead => lead.id);
      setSelectedLeads(eligibleLeads);
    } else {
      setSelectedLeads([]);
    }
  };

  const getSelectedLeadsData = () => {
    return leads.filter(lead => selectedLeads.includes(lead.id));
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;
    
    if (!confirm(`האם אתה בטוח שברצונך למחוק ${selectedLeads.length} לידים? פעולה זו אינה הפיכה.`)) {
      return;
    }

    try {
      // מחיקה ברצף עם השהיות קטנות כדי למנוע rate limit
      for (let i = 0; i < selectedLeads.length; i++) {
        const leadId = selectedLeads[i];
        await MarketingLead.delete(leadId);
        
        // השהיה קטנה בין מחיקות
        if (i < selectedLeads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      setSelectedLeads([]);
      loadLeads();
      alert(`נמחקו ${selectedLeads.length} לידים בהצלחה`);
    } catch (error) {
      console.error("Error deleting leads:", error);
      alert("שגיאה במחיקת הלידים");
    }
  };

  // פונקציה חדשה לסימון לידים כלא מעוניינים בדיוור
  const handleMarkAsOptOut = async () => {
    if (selectedLeads.length === 0) return;
    
    if (!confirm(`האם אתה בטוח שברצונך לסמן ${selectedLeads.length} לידים כ"לא מעוניין בדיוור"?`)) {
      return;
    }

    try {
      // עדכון כל הלידים הנבחרים
      for (let i = 0; i < selectedLeads.length; i++) {
        const leadId = selectedLeads[i];
        await MarketingLead.update(leadId, { opt_out_whatsapp: "כן" });
        
        // השהיה קטנה בין עדכונים
        if (i < selectedLeads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setSelectedLeads([]);
      loadLeads();
      alert(`${selectedLeads.length} לידים סומנו כ"לא מעוניין בדיוור"`);
    } catch (error) {
      console.error("Error marking leads as opt-out:", error);
      alert("שגיאה בעדכון הלידים");
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
              <MessageCircle className="w-8 h-8 text-blue-600" />
              לידים לדיוור
            </h1>
            <p className="text-slate-600 mt-1">ייבוא ושליחת הודעות וואטסאפ ללקוחות פוטנציאליים</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={() => setShowImport(!showImport)}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Upload className="w-5 h-5 ml-2" />
              ייבוא מקובץ
            </Button>
            {selectedLeads.length > 0 && (
              <>
                <Button 
                  onClick={() => setShowSender(true)}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  שלח לנבחרים ({selectedLeads.length})
                </Button>
                <Button 
                  onClick={handleMarkAsOptOut}
                  className="bg-orange-600 hover:bg-orange-700 shadow-lg"
                >
                  לא מעוניין בדיוור ({selectedLeads.length})
                </Button>
                <Button 
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  className="shadow-lg"
                >
                  מחק נבחרים ({selectedLeads.length})
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <MarketingFilters 
              filters={filters}
              onFiltersChange={setFilters}
              leads={leads}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="חפש לפי שם, טלפון או שכונה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant={quickFilter === 'all' ? 'default' : 'outline'} onClick={() => setQuickFilter('all')}>הכל</Button>
                  <Button size="sm" variant={quickFilter === 'never' ? 'default' : 'outline'} onClick={() => setQuickFilter('never')}>לא נשלח מעולם</Button>
                  <Button size="sm" variant={quickFilter === '7days' ? 'default' : 'outline'} onClick={() => setQuickFilter('7days')}>נשלח ב-7 ימים האחרונים</Button>
                  <Button size="sm" variant={quickFilter === '30days' ? 'default' : 'outline'} onClick={() => setQuickFilter('30days')}>נשלח ב-30 ימים האחרונים</Button>
              </div>
            </motion.div>

            {showImport && (
              <ExcelImport
                onSuccess={handleImportSuccess}
                onCancel={() => setShowImport(false)}
              />
            )}

            <MarketingLeadsList
              leads={filteredLeads}
              selectedLeads={selectedLeads}
              isLoading={isLoading}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
            />
          </div>
        </div>

        {showSender && (
          <WhatsAppSender
            selectedLeads={getSelectedLeadsData()}
            onClose={() => setShowSender(false)}
            onSuccess={() => {
              setSelectedLeads([]);
              setShowSender(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
