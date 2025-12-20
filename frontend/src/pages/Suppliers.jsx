import React, { useState, useEffect } from "react";
import { Supplier } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Wrench } from "lucide-react";
import { motion } from "framer-motion";

import SupplierList from "../components/suppliers/SupplierList";
import SupplierForm from "../components/suppliers/SupplierForm";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const suppliersData = await Supplier.list("-created_date");
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
    setIsLoading(false);
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier => 
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.includes(searchTerm)
      );
    }

    setFilteredSuppliers(filtered);
  };

  const handleSubmit = async (supplierData) => {
    try {
      if (editingSupplier) {
        await Supplier.update(editingSupplier.id, supplierData);
      } else {
        await Supplier.create(supplierData);
      }
      setShowForm(false);
      setEditingSupplier(null);
      loadSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = async (supplierId) => {
    try {
      await Supplier.delete(supplierId);
      loadSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
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
              <Wrench className="w-8 h-8 text-blue-600" />
              ניהול ספקים
            </h1>
            <p className="text-slate-600 mt-1">נהל את כל הספקים והקבלנים</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            ספק חדש
          </Button>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="חפש ספקים לפי שם, התמחות או טלפון..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </motion.div>

          {showForm && (
            <SupplierForm
              supplier={editingSupplier}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingSupplier(null);
              }}
            />
          )}

          <SupplierList
            suppliers={filteredSuppliers}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}