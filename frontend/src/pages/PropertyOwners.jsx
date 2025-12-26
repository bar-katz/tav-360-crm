import React, { useState, useEffect } from "react";
import { PropertyOwner, Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PropertyOwnersList from "../components/owners/PropertyOwnersList";
import PropertyOwnersForm from "../components/owners/PropertyOwnersForm";
import PropertyOwnersFilters from "../components/owners/PropertyOwnersFilters";

export default function PropertyOwnersPage() {
  const [owners, setOwners] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    property_type: "all"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  // קריאת פרמטר contact_id מה-URL
  const urlParams = new URLSearchParams(window.location.search);
  const contactIdParam = urlParams.get('contact_id');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOwners();
  }, [owners, searchTerm, filters, contactIdParam]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ownersData, contactsData] = await Promise.all([
        PropertyOwner.list("-created_date"),
        Contact.list()
      ]);
      setOwners(ownersData);
      setContacts(contactsData);
      
      // אם יש contact_id בפרמטרים, חפש את איש הקשר
      if (contactIdParam) {
        const contactIdNum = parseInt(contactIdParam, 10);
        const contact = contactsData.find(c => c.id === contactIdNum || c.id === contactIdParam);
        setSelectedContact(contact);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filterOwners = () => {
    let filtered = owners;

    // סינון לפי איש קשר נבחר (אם יש)
    if (contactIdParam) {
      const contactIdNum = parseInt(contactIdParam, 10);
      filtered = filtered.filter(owner => owner.contact_id === contactIdNum || owner.contact_id === contactIdParam);
    }

    if (searchTerm) {
      filtered = filtered.filter(owner => {
        const contact = contacts.find(c => c.id === owner.contact_id);
        return contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               owner.city?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(owner => owner.status === filters.status);
    }

    if (filters.property_type !== "all") {
      filtered = filtered.filter(owner => owner.property_type === filters.property_type);
    }

    setFilteredOwners(filtered);
  };

  const handleSubmit = async (ownerData) => {
    try {
      // אם אנחנו בתצוגת איש קשר ספציפי ולא נבחר איש קשר בטופס, השתמש בו
      if (contactIdParam && !ownerData.contact_id) {
        ownerData.contact_id = contactIdParam;
      }
      
      if (editingOwner) {
        await PropertyOwner.update(editingOwner.id, ownerData);
      } else {
        await PropertyOwner.create(ownerData);
      }
      setShowForm(false);
      setEditingOwner(null);
      loadData();
    } catch (error) {
      console.error("Error saving owner:", error);
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setShowForm(true);
  };

  const handleDelete = async (ownerId) => {
    try {
      await PropertyOwner.delete(ownerId);
      loadData();
    } catch (error) {
      console.error("Error deleting owner:", error);
    }
  };

  const pageTitle = selectedContact 
    ? `נכסים בניהול - ${selectedContact.full_name}`
    : "נכסים בניהול";

  const pageDescription = selectedContact
    ? `כל הנכסים שבניהול עבור ${selectedContact.full_name}`
    : "נהל את כל הנכסים במערכת";

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            {/* ניווט חזרה אם אנחנו בתצוגת איש קשר ספציפי */}
            {selectedContact && (
              <div className="mb-3">
                <Link 
                  to={createPageUrl('PropertyOwnerManagement')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  חזרה לרשימת בעלי נכסים
                </Link>
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              {pageTitle}
            </h1>
            <p className="text-slate-600 mt-1">{pageDescription}</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            נכס חדש
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {!contactIdParam && (
            <div className="lg:col-span-1">
              <PropertyOwnersFilters 
                filters={filters}
                onFiltersChange={setFilters}
                owners={owners}
              />
            </div>
          )}

          <div className={contactIdParam ? "lg:col-span-4" : "lg:col-span-3"}>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder={selectedContact ? "חפש נכסים..." : "חפש בעלי נכסים לפי שם או עיר..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </motion.div>

              {showForm && (
                <PropertyOwnersForm
                  owner={editingOwner}
                  contacts={contacts}
                  preSelectedContactId={contactIdParam}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingOwner(null);
                  }}
                />
              )}

              <PropertyOwnersList
                owners={filteredOwners}
                contacts={contacts}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                selectedContact={selectedContact}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}