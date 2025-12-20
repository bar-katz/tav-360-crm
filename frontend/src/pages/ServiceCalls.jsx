
import React, { useState, useEffect } from "react";
import { ServiceCall } from "@/api/entities";
import { Contact } from "@/api/entities";
import { PropertyOwner } from "@/api/entities";
import { Supplier } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone } from "lucide-react";
import { motion } from "framer-motion";

import ServiceCallList from "../components/servicecalls/ServiceCallList";
import ServiceCallForm from "../components/servicecalls/ServiceCallForm";
import ServiceCallFilters from "../components/servicecalls/ServiceCallFilters";

export default function ServiceCalls() {
  const [serviceCalls, setServiceCalls] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredServiceCalls, setFilteredServiceCalls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingServiceCall, setEditingServiceCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    urgency: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterServiceCalls();
  }, [serviceCalls, searchTerm, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [serviceCallsData, contactsData, propertiesData, suppliersData] = await Promise.all([
        ServiceCall.list("-created_date"),
        Contact.list(),
        PropertyOwner.list(),
        Supplier.list()
      ]);
      setServiceCalls(serviceCallsData);
      setContacts(contactsData);
      setProperties(propertiesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterServiceCalls = () => {
    let filtered = serviceCalls;

    if (searchTerm) {
      filtered = filtered.filter(call => 
        call.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.call_number?.toString().includes(searchTerm)
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(call => call.status === filters.status);
    }

    setFilteredServiceCalls(filtered);
  };

  const handleSubmit = async (serviceCallData) => {
    try {
      if (editingServiceCall) {
        await ServiceCall.update(editingServiceCall.id, serviceCallData);
      } else {
        await ServiceCall.create(serviceCallData);
      }
      setShowForm(false);
      setEditingServiceCall(null);
      loadData();
    } catch (error) {
      console.error("Error saving service call:", error);
    }
  };

  const handleEdit = (serviceCall) => {
    setEditingServiceCall(serviceCall);
    setShowForm(true);
  };

  const handleStatusChange = async (serviceCallId, newStatus) => {
    try {
      await ServiceCall.update(serviceCallId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error("Error updating service call status:", error);
    }
  };

  const handleDelete = async (serviceCallId) => {
    try {
      await ServiceCall.delete(serviceCallId);
      loadData();
    } catch (error) {
      console.error("Error deleting service call:", error);
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
              <Phone className="w-8 h-8 text-blue-600" />
              קריאות שירות
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל קריאות השירות והתחזוקה</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            קריאה חדשה
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ServiceCallFilters 
              filters={filters}
              onFiltersChange={setFilters}
              serviceCalls={serviceCalls}
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
                  placeholder="חפש קריאות לפי תיאור או מספר קריאה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </motion.div>

            {showForm && (
              <ServiceCallForm
                serviceCall={editingServiceCall}
                contacts={contacts}
                properties={properties}
                suppliers={suppliers}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingServiceCall(null);
                }}
              />
            )}

            <ServiceCallList
              serviceCalls={filteredServiceCalls}
              contacts={contacts}
              properties={properties}
              suppliers={suppliers}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
