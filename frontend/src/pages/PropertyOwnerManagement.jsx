import React, { useState, useEffect } from "react";
import { PropertyOwner, Contact } from "@/api/entities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { User, Building, Search, Briefcase, Eye, Plus, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function PropertyOwnerManagement() {
  const [propertyOwners, setPropertyOwners] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [ownersWithProperties, setOwnersWithProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    processOwnersData();
  }, [propertyOwners, contacts]);

  useEffect(() => {
    filterOwners();
  }, [ownersWithProperties, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ownersData, contactsData] = await Promise.all([
        PropertyOwner.list("-created_date"),
        Contact.list()
      ]);
      setPropertyOwners(ownersData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const processOwnersData = () => {
    // קבוצת כל contact_id הייחודיים מנכסים בניהול
    const uniqueContactIds = [...new Set(propertyOwners.map(owner => owner.contact_id))];
    
    // יצירת רשימה של בעלי נכסים עם פרטים מלאים
    const ownersWithDetails = uniqueContactIds.map(contactId => {
      const contact = contacts.find(c => c.id === contactId);
      const ownerProperties = propertyOwners.filter(owner => owner.contact_id === contactId);
      
      return {
        contactId,
        contact,
        propertyCount: ownerProperties.length,
        properties: ownerProperties,
        lastUpdated: Math.max(...ownerProperties.map(p => new Date(p.updated_date || p.created_date).getTime()))
      };
    }).filter(owner => owner.contact); // רק בעלי נכסים עם איש קשר חוקי

    setOwnersWithProperties(ownersWithDetails.sort((a, b) => b.lastUpdated - a.lastUpdated));
  };

  const filterOwners = () => {
    let filtered = ownersWithProperties;

    if (searchTerm) {
      filtered = filtered.filter(owner => 
        owner.contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.contact?.phone?.includes(searchTerm) ||
        owner.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOwners(filtered);
  };

  const handleCreateNewContact = async () => {
    if (!newContactName.trim()) {
      alert("שם בעל הנכס לא יכול להיות ריק.");
      return;
    }
    setIsCreatingContact(true);
    try {
      const newContact = await Contact.create({ full_name: newContactName.trim() });
      setNewContactName("");
      setShowNewContactDialog(false);
      // After creating the contact, navigate to PropertyOwners page with the new contact's ID
      navigate(`${createPageUrl('PropertyOwners')}?contact_id=${newContact.id}`);
    } catch (error) {
      console.error("Error creating new contact:", error);
      alert("שגיאה ביצירת איש קשר חדש.");
    } finally {
      setIsCreatingContact(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen" style={{ direction: 'rtl' }}>
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-3" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              <Briefcase className="w-8 h-8 text-blue-600" />
              בעלי נכסים
            </h1>
            <p className="text-slate-600 mt-1">בחר בעל נכס כדי לראות את כל הנכסים שבניהול</p>
            <p className="text-sm text-slate-500 mt-2">
              {filteredOwners.length} בעלי נכסים • {propertyOwners.length} נכסים בניהול
            </p>
          </div>
          <Button 
            onClick={() => setShowNewContactDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            בעל נכס חדש
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="חפש בעלי נכסים לפי שם, טלפון או אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredOwners.length === 0 ? (
            <Card className="p-12 text-center">
              <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                {searchTerm ? 'לא נמצאו בעלי נכסים' : 'אין בעלי נכסים במערכת'}
              </h3>
              <p className="text-slate-400">
                {searchTerm 
                  ? 'נסה לחפש במילות חיפוש אחרות'
                  : 'בעלי נכסים עם נכסים בניהול יופיעו כאן'
                }
              </p>
            </Card>
          ) : (
            filteredOwners.map((owner, index) => (
              <motion.div
                key={owner.contactId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {owner.contact.full_name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Building className="w-4 h-4" />
                              <span>{owner.propertyCount} נכסים בניהול</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600">
                          {owner.contact.phone && (
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 text-center">📞</span>
                              <span>{owner.contact.phone}</span>
                            </div>
                          )}
                          {owner.contact.email && (
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 text-center">📧</span>
                              <span>{owner.contact.email}</span>
                            </div>
                          )}
                        </div>

                        {/* תצוגה מקדימה של הנכסים */}
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-slate-500 mb-2">נכסים בניהול:</p>
                          <div className="flex flex-wrap gap-2">
                            {owner.properties.slice(0, 3).map((property, idx) => (
                              <div key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {property.property_type} {property.city && `ב${property.city}`}
                                {property.rooms && ` • ${property.rooms} חדרים`}
                              </div>
                            ))}
                            {owner.properties.length > 3 && (
                              <div className="text-xs text-slate-500 px-2 py-1">
                                +{owner.properties.length - 3} נוספים
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Link to={`${createPageUrl('PropertyOwners')}?contact_id=${owner.contactId}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Eye className="w-4 h-4 ml-2" />
                            צפה בנכסים
                          </Button>
                        </Link>
                        
                        <div className="text-xs text-slate-400 text-left">
                          עודכן לאחרונה:<br />
                          {new Date(owner.lastUpdated).toLocaleDateString('he-IL')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* New Contact Dialog */}
      <Dialog open={showNewContactDialog} onOpenChange={setShowNewContactDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הוספת בעל נכס חדש</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactName" className="text-right">
                שם מלא
              </Label>
              <Input
                id="contactName"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="col-span-3"
                placeholder="הקלד שם בעל נכס"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewContactDialog(false)}>ביטול</Button>
            <Button onClick={handleCreateNewContact} disabled={isCreatingContact}>
              {isCreatingContact && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              צור בעל נכס
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}