import React, { useState, useEffect, useCallback } from "react";
import { PropertyBrokerage as PropertyBrokerageEntity, Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Building2 } from "lucide-react";
import { motion } from "framer-motion";

import PropertyBrokerageList from "../components/properties/PropertyBrokerageList";
import PropertyBrokerageForm from "../components/properties/PropertyBrokerageForm";
import PropertyBrokerageFilters from "../components/properties/PropertyBrokerageFilters";

export default function PropertyBrokerage() {
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

  // קריאת פרמטר הקטגוריה מה-URL
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category') || 'מגורים';

  const filterProperties = useCallback(() => {
    let filtered = properties;

    // סינון לפי קטגוריה מה-URL
    filtered = filtered.filter((property) => {
      if (categoryParam === "מגורים") {
        return property.category === "פרטי";
      } else if (categoryParam === "משרדים") {
        return property.category === "מסחרי";
      }
      return true;
    });

    // סינון לפי חיפוש
    if (searchTerm) {
      filtered = filtered.filter((property) =>
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.property_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // סינון לפי פילטרים
    if (filters.status !== "all") {
      filtered = filtered.filter((property) => property.status === filters.status);
    }

    // פילטרים ספציפיים למגורים בלבד
    if (categoryParam === "מגורים") {
      if (filters.property_type !== "all") {
        filtered = filtered.filter((property) => property.property_type === filters.property_type);
      }
      
      if (filters.rooms !== "all") {
        filtered = filtered.filter((property) => property.rooms === filters.rooms);
      }
    }

    if (filters.city !== "all") {
      filtered = filtered.filter((property) => property.city === filters.city);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, filters, categoryParam]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [filterProperties]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, contactsData] = await Promise.all([
      PropertyBrokerageEntity.list("-created_date"),
      Contact.list()]
      );
      setProperties(propertiesData);
      setContacts(contactsData);
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