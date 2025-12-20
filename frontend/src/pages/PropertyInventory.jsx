import React, { useState, useEffect } from "react";
import { PropertyInventory, Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Archive } from "lucide-react";
import { motion } from "framer-motion";

import PropertyInventoryList from "../components/inventory/PropertyInventoryList";
import PropertyInventoryForm from "../components/inventory/PropertyInventoryForm";
import PropertyInventoryFilters from "../components/inventory/PropertyInventoryFilters";

export default function PropertyInventoryPage() {
  const [properties, setProperties] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    property_type: "all",
    area: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propertiesData, contactsData] = await Promise.all([
        PropertyInventory.list("-created_date"),
        Contact.list()
      ]);
      setProperties(propertiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.property_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(property => property.category === filters.category);
    }

    if (filters.property_type !== "all") {
      filtered = filtered.filter(property => property.property_type === filters.property_type);
    }

    if (filters.area !== "all") {
      filtered = filtered.filter(property => property.area === filters.area);
    }

    setFilteredProperties(filtered);
  };

  const handleSubmit = async (propertyData) => {
    try {
      if (editingProperty) {
        await PropertyInventory.update(editingProperty.id, propertyData);
      } else {
        await PropertyInventory.create(propertyData);
      }
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
    try {
      await PropertyInventory.delete(propertyId);
      loadData();
    } catch (error) {
      console.error("Error deleting property:", error);
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
              <Archive className="w-8 h-8 text-blue-600" />
              מאגר נכסים
            </h1>
            <p className="text-slate-600 mt-1">נהל את מאגר הנכסים במערכת</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            נכס חדש למאגר
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PropertyInventoryFilters 
              filters={filters}
              onFiltersChange={setFilters}
              properties={properties}
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
                  placeholder="חפש נכסים לפי עיר, רחוב או סוג נכס..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <PropertyInventoryForm
                property={editingProperty}
                contacts={contacts}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProperty(null);
                }}
              />
            )}

            <PropertyInventoryList
              properties={filteredProperties}
              contacts={contacts}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}