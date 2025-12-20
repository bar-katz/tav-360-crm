import React, { useState, useEffect } from "react";
import { BuyersRenters as BuyersRentersEntity, Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";

import BuyersRentersList from "../components/buyers/BuyersRentersList";
import BuyersRentersForm from "../components/buyers/BuyersRentersForm";
import BuyersRentersFilters from "../components/buyers/BuyersRentersFilters";

export default function BuyersRenters() {
  const [buyers, setBuyers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    request_type: "all",
    property_type: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBuyers();
  }, [buyers, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [buyersData, contactsData] = await Promise.all([
        BuyersRentersEntity.list("-created_date"),
        Contact.list()
      ]);
      setBuyers(buyersData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterBuyers = () => {
    let filtered = buyers;

    if (searchTerm) {
      filtered = filtered.filter(buyer => {
        const contact = contacts.find(c => c.id === buyer.contact_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               buyer.preferred_property_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               buyer.preferred_area?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(buyer => buyer.status === filters.status);
    }

    if (filters.request_type !== "all") {
      filtered = filtered.filter(buyer => buyer.request_type === filters.request_type);
    }

    if (filters.property_type !== "all") {
      filtered = filtered.filter(buyer => buyer.preferred_property_type === filters.property_type);
    }

    setFilteredBuyers(filtered);
  };

  const handleSubmit = async (buyerData) => {
    try {
      if (editingBuyer) {
        await BuyersRentersEntity.update(editingBuyer.id, buyerData);
      } else {
        await BuyersRentersEntity.create(buyerData);
      }
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
    try {
      await BuyersRentersEntity.delete(buyerId);
      loadData();
    } catch (error) {
      console.error("Error deleting buyer:", error);
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
              <Users className="w-8 h-8 text-blue-600" />
              קונים / שוכרים
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הקונים והשוכרים במערכת</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            ליד חדש
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <BuyersRentersFilters 
              filters={filters}
              onFiltersChange={setFilters}
              buyers={buyers}
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
                  placeholder="חפש לפי שם, סוג נכס או אזור..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <BuyersRentersForm
                buyer={editingBuyer}
                contacts={contacts}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingBuyer(null);
                }}
              />
            )}

            <BuyersRentersList
              buyers={filteredBuyers}
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