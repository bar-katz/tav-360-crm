import React, { useState, useEffect, useCallback } from "react";
import { BuyersBrokerage, Contact, PropertyBrokerage, MatchesBrokerage } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";

import BuyersList from "../components/buyers/BuyersList";
import BuyersForm from "../components/buyers/BuyersForm";
import BuyersFilters from "../components/buyers/BuyersFilters";

export default function BuyersBrokeragePage() {
  const [buyers, setBuyers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    request_category: "all",
    desired_property_type: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  // קריאת פרמטר הקטגוריה מה-URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category') || 'מגורים';

  const filterBuyers = useCallback(() => {
    let filtered = buyers;

    // סינון לפי קטגוריה מה-URL
    filtered = filtered.filter(buyer => {
      if (categoryParam === "מגורים") {
        return buyer.desired_property_type === "דירה" || buyer.desired_property_type === "בית פרטי";
      } else if (categoryParam === "משרדים") {
        return buyer.desired_property_type === "משרד";
      }
      return true;
    });

    // סינון לפי חיפוש
    if (searchTerm) {
      filtered = filtered.filter(buyer => {
        const contact = contacts.find(c => c.id === buyer.contact_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               buyer.city?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // סינון לפי פילטרים
    if (filters.status !== "all") {
      filtered = filtered.filter(buyer => buyer.status === filters.status);
    }

    if (filters.request_category !== "all") {
      filtered = filtered.filter(buyer => buyer.request_category === filters.request_category);
    }

    if (filters.desired_property_type !== "all") {
      filtered = filtered.filter(buyer => buyer.desired_property_type === filters.desired_property_type);
    }

    setFilteredBuyers(filtered);
  }, [buyers, searchTerm, filters, categoryParam, contacts]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBuyers();
  }, [filterBuyers]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [buyersData, contactsData, propertiesData] = await Promise.all([
        BuyersBrokerage.list("-created_date"),
        Contact.list(),
        PropertyBrokerage.list()
      ]);
      setBuyers(buyersData);
      setContacts(contactsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // סינון לקוחות לפי סוג בקשה לטאבים
  const getBuyersByRequestCategory = (requestCategory) => {
    return filteredBuyers.filter(buyer => buyer.request_category === requestCategory);
  };

  const handleSubmit = async (buyerData) => {
    try {
      // הטופס כבר משתמש בפונקציות האבטחה
      setShowForm(false);
      setEditingBuyer(null);
      loadData();
    } catch (error) {
      console.error("Error saving buyer:", error);
    }
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer);
    setShowForm(true);
  };

  const handleDelete = async (buyerId) => {
    // הטיפול במחיקה מועבר לקומפוננטת הרשימה עם פונקציות האבטחה
    loadData();
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
              <Users className="w-8 h-8 text-blue-600" />
              לקוחות - {categoryParam}
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הלקוחות והמעוניינים בתיווך</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            לקוח חדש
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <BuyersFilters 
              filters={filters}
              onFiltersChange={setFilters}
              buyers={filteredBuyers}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="חפש לקוחות לפי שם או עיר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <BuyersForm
                buyer={editingBuyer}
                contacts={contacts}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingBuyer(null);
                }}
              />
            )}

            <Tabs defaultValue="purchase" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchase">קנייה</TabsTrigger>
                <TabsTrigger value="rental">השכרה</TabsTrigger>
              </TabsList>

              <TabsContent value="purchase" className="space-y-6">
                <BuyersList
                  buyers={getBuyersByRequestCategory("קנייה")}
                  contacts={contacts}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>

              <TabsContent value="rental" className="space-y-6">
                <BuyersList
                  buyers={getBuyersByRequestCategory("השכרה")}
                  contacts={contacts}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}