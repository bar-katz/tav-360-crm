import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PropertyBrokerage as PropertyBrokerageEntity, Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Building2 } from "lucide-react";
import { motion } from "framer-motion";

import PropertyBrokerageList from "../components/properties/PropertyBrokerageList";
import PropertyBrokerageForm from "../components/properties/PropertyBrokerageForm";
import PropertyBrokerageFilters from "../components/properties/PropertyBrokerageFilters";
import { getCategoryFromURL } from "@/utils/categoryFilters";

export default function PropertyBrokerage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // פילטרים מותנים לפי סוג הקטגוריה
  const [filters, setFilters] = useState({
    status: "all",
    property_type: "all", // רק למגורים
    city: "all",
    rooms: "all" // רק למגורים
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
      
      // Category filter
      if (categoryParam) {
        postgrestFilters.category = `eq.${categoryParam}`;
      }
      
      // Status filter
      if (filters.status !== "all") {
        postgrestFilters.status = `eq.${filters.status}`;
      }
      
      // Property type filter (only for residential)
      if (categoryParam === "מגורים" && filters.property_type !== "all") {
        postgrestFilters.property_type = `eq.${filters.property_type}`;
      }
      
      // Rooms filter (only for residential)
      if (categoryParam === "מגורים" && filters.rooms !== "all") {
        postgrestFilters.rooms = `eq.${filters.rooms}`;
      }
      
      // City filter
      if (filters.city !== "all") {
        postgrestFilters.city = `eq.${filters.city}`;
      }
      
      // Search filter
      if (searchTerm) {
        postgrestFilters.or = `(city.ilike.*${searchTerm}*,street.ilike.*${searchTerm}*,property_type.ilike.*${searchTerm}*)`;
      }
      
      // Load properties with joined contact data using PostgREST
      const propertiesData = await PropertyBrokerageEntity.list(postgrestFilters, {
        select: ['*', 'contact(*)'],
        order: 'created_date.desc',
        limit: 1000
      });
      
      setProperties(propertiesData);
      setFilteredProperties(propertiesData);
      
      // Extract contacts from joined data
      const contactsMap = new Map();
      propertiesData.forEach(property => {
        if (property.contact) {
          contactsMap.set(property.contact.id, property.contact);
        }
      });
      setContacts(Array.from(contactsMap.values()));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // סינון נכסים לפי סוג עסקה לטאבים
  const getPropertiesByListingType = (listingType) => {
    return filteredProperties.filter((property) => property.listing_type === listingType);
  };

  const handleSubmit = async (propertyData) => {
    try {
      // הטופס כבר משתמש בפונקציות האבטחה
      setShowForm(false);
      setEditingProperty(null);
      loadData();
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (propertyId) => {
    // הטיפול במחיקה מועבר לקומפוננטת הרשימה עם פונקציות האבטחה
    loadData();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              נכסים - {categoryParam}
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הנכסים לתיווך במערכת</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg">

            <Plus className="w-5 h-5 ml-2" />
            נכס חדש
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PropertyBrokerageFilters
              filters={filters}
              onFiltersChange={setFilters}
              properties={filteredProperties}
              category={categoryParam} />

          </div>

          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4">

              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="חפש נכסים לפי עיר, רחוב או סוג נכס..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10" />

              </div>
            </motion.div>

            {showForm &&
            <PropertyBrokerageForm
              property={editingProperty}
              contacts={contacts}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingProperty(null);
              }} />

            }

            <Tabs defaultValue="sale" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sale">מכירה</TabsTrigger>
                <TabsTrigger value="rental">השכרה</TabsTrigger>
              </TabsList>

              <TabsContent value="sale" className="space-y-6">
                <PropertyBrokerageList
                  properties={getPropertiesByListingType("מכירה")}
                  contacts={contacts}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete} />

              </TabsContent>

              <TabsContent value="rental" className="space-y-6">
                <PropertyBrokerageList
                  properties={getPropertiesByListingType("השכרה")}
                  contacts={contacts}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete} />

              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}