import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BuyersBrokerage, Contact, PropertyBrokerage, MatchesBrokerage } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";

import BuyersList from "../components/buyers/BuyersList";
import BuyersForm from "../components/buyers/BuyersForm";
import BuyersFilters from "../components/buyers/BuyersFilters";
import { getCategoryFromURL } from "@/utils/categoryFilters";

export default function BuyersBrokeragePage() {
  const [searchParams] = useSearchParams();
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

  // קריאת פרמטר הקטגוריה מה-URL - using unified utility with React Router
  const categoryParam = getCategoryFromURL("מגורים", searchParams);

  useEffect(() => {
    loadData();
  }, [categoryParam, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Build PostgREST filters
      const postgrestFilters = {};
      
      // Category filter - use preferred_property_type
      if (categoryParam === "מגורים") {
        postgrestFilters.preferred_property_type = "in.(דירה,בית פרטי,בית)";
      } else if (categoryParam === "משרדים") {
        postgrestFilters.preferred_property_type = "in.(משרד,מסחרי)";
      }
      
      // Status filter
      if (filters.status !== "all") {
        postgrestFilters.status = `eq.${filters.status}`;
      }
      
      // Request type filter
      if (filters.request_category !== "all") {
        postgrestFilters.request_type = `eq.${filters.request_category}`;
      }
      
      // Property type filter
      if (filters.desired_property_type !== "all") {
        postgrestFilters.preferred_property_type = `eq.${filters.desired_property_type}`;
      }
      
      // Search filter - use PostgREST or operator
      if (searchTerm) {
        postgrestFilters.or = `(city.ilike.*${searchTerm}*,contact.full_name.ilike.*${searchTerm}*)`;
      }
      
      // Load buyers with joined contact data using PostgREST
      const buyersData = await BuyersBrokerage.list(postgrestFilters, {
        select: ['*', 'contact(*)'],
        order: 'created_date.desc',
        limit: 1000
      });
      
      setBuyers(buyersData);
      setFilteredBuyers(buyersData);
      
      // Load properties for form (if needed)
      const propertiesData = await PropertyBrokerage.list(
        categoryParam ? { category: `eq.${categoryParam}` } : {},
        { limit: 100 }
      );
      setProperties(propertiesData);
      
      // Extract contacts from joined data
      const contactsMap = new Map();
      buyersData.forEach(buyer => {
        if (buyer.contact) {
          contactsMap.set(buyer.contact.id, buyer.contact);
        }
      });
      setContacts(Array.from(contactsMap.values()));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // סינון לקוחות לפי סוג בקשה לטאבים
  const getBuyersByRequestCategory = (requestCategory) => {
    return filteredBuyers.filter(buyer => {
      const buyerRequestType = buyer.request_type || buyer.request_category;
      return buyerRequestType === requestCategory;
    });
  };

  const handleSubmit = async (buyerData) => {
    try {
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
                  buyers={getBuyersByRequestCategory("מכירה")}
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