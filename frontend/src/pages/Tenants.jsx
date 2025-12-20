import React, { useState, useEffect } from "react";
import { Tenant, Contact, PropertyOwner } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

import TenantsList from "../components/tenants/TenantsList";
import TenantsForm from "../components/tenants/TenantsForm";
import TenantsFilters from "../components/tenants/TenantsFilters";

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tenantsData, contactsData, propertiesData] = await Promise.all([
        Tenant.list("-created_date"),
        Contact.list(),
        PropertyOwner.list()
      ]);
      setTenants(tenantsData);
      setContacts(contactsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterTenants = () => {
    let filtered = tenants;

    if (searchTerm) {
      filtered = filtered.filter(tenant => {
        const contact = contacts.find(c => c.id === tenant.contact_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tenant.city?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(tenant => tenant.status === filters.status);
    }

    setFilteredTenants(filtered);
  };

  const handleSubmit = async (tenantData) => {
    try {
      if (editingTenant) {
        await Tenant.update(editingTenant.id, tenantData);
      } else {
        await Tenant.create(tenantData);
      }
      setShowForm(false);
      setEditingTenant(null);
      loadData();
    } catch (error) {
      console.error("Error saving tenant:", error);
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDelete = async (tenantId) => {
    try {
      await Tenant.delete(tenantId);
      loadData();
    } catch (error) {
      console.error("Error deleting tenant:", error);
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
              <UserPlus className="w-8 h-8 text-blue-600" />
              דיירים
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הדיירים במערכת</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            דייר חדש
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TenantsFilters 
              filters={filters}
              onFiltersChange={setFilters}
              tenants={tenants}
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
                  placeholder="חפש דיירים לפי שם או עיר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <TenantsForm
                tenant={editingTenant}
                contacts={contacts}
                properties={properties}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTenant(null);
                }}
              />
            )}

            <TenantsList
              tenants={filteredTenants}
              contacts={contacts}
              properties={properties}
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