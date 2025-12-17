import React, { useState, useEffect } from "react";
import { BuyersBrokerage } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";

import BuyersList from "../components/buyers/BuyersList";
import BuyersForm from "../components/buyers/BuyersForm";
import BuyersFilters from "../components/buyers/BuyersFilters";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    request_category: "all",
    desired_property_type: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, contactsData] = await Promise.all([
        BuyersBrokerage.list("-created_date"),
        Contact.list()
      ]);
      setClients(clientsData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client => {
        const contact = contacts.find(c => c.id === client.contact_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               client.desired_property_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               client.city?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(client => client.status === filters.status);
    }

    if (filters.request_category !== "all") {
      filtered = filtered.filter(client => client.request_category === filters.request_category);
    }

    if (filters.desired_property_type !== "all") {
      filtered = filtered.filter(client => client.desired_property_type === filters.desired_property_type);
    }

    setFilteredClients(filtered);
  };

  const handleSubmit = async (clientData) => {
    try {
      if (editingClient) {
        await BuyersBrokerage.update(editingClient.id, clientData);
      } else {
        await BuyersBrokerage.create(clientData);
      }
      setShowForm(false);
      setEditingClient(null);
      loadData();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    try {
      await BuyersBrokerage.delete(clientId);
      loadData();
    } catch (error) {
      console.error("Error deleting client:", error);
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
              ניהול לקוחות
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הלקוחות והמעוניינים במערכת</p>
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
              buyers={clients}
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
                  placeholder="חפש לקוחות לפי שם, סוג נכס או עיר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <BuyersForm
                buyer={editingClient}
                contacts={contacts}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingClient(null);
                }}
              />
            )}

            <BuyersList
              buyers={filteredClients}
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