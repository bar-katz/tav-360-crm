
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building, Phone, Mail, Edit, Trash2, MapPin, Calendar } from "lucide-react";

const statusColors = {
  "נכס חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "אין מענה": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "פולואפ": "bg-purple-100 text-purple-800 border-purple-200",
  "נחתם הסכם ניהול": "bg-green-100 text-green-800 border-green-200",
  "נכס פורסם": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "נחתם הסכם שכירות": "bg-teal-100 text-teal-800 border-teal-200"
};

export default function PropertyOwnersList({ owners, contacts, isLoading, onEdit, onDelete }) {
  const getContactById = (contactId) => {
    return contacts.find(c => c.id === contactId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (owners.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Building className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין בעלי נכסים להצגה</h3>
        <p className="text-slate-400">בעלי נכסים שיתווספו יופיעו כאן</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {owners.map((owner, index) => {
          const contact = getContactById(owner.contact_id);
          return (
            <motion.div
              key={owner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {contact?.full_name || "בעל נכס"}
                          </h3>
                          <p className="text-slate-600">
                            {owner.property_type} ב{owner.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`${statusColors[owner.status]} border`}>
                          {owner.status}
                        </Badge>
                        <Badge variant="secondary">{owner.source}</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-600">
                        {owner.street && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{owner.street} {owner.building_number}, {owner.city}</span>
                          </div>
                        )}
                        {contact?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(owner)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(owner.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {owner.management_fee && (
                        <div className="flex items-center gap-1 text-green-700 font-semibold">
                          <span>{owner.management_fee.toLocaleString()} ₪</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {owner.rooms && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span>{owner.rooms} חדרים</span>
                      </div>
                    )}
                    {owner.floor && (
                      <div className="text-slate-600">
                        קומה {owner.floor}{owner.total_floors && ` מתוך ${owner.total_floors}`}
                      </div>
                    )}
                    {owner.lease_start_date && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Calendar className="w-4 h-4" />
                        <span>מ-{new Date(owner.lease_start_date).toLocaleDateString('he-IL')}</span>
                      </div>
                    )}
                    {owner.lease_end_date && (
                      <div className="flex items-center gap-2 text-red-600">
                        <Calendar className="w-4 h-4" />
                        <span>עד-{new Date(owner.lease_end_date).toLocaleDateString('he-IL')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    {owner.parking && (
                      <span className="flex items-center gap-1 text-green-600">
                        ✓ חניה
                      </span>
                    )}
                    {owner.air_conditioning && (
                      <span className="flex items-center gap-1 text-blue-600">
                        ✓ מזגן
                      </span>
                    )}
                    {owner.storage && (
                      <span className="flex items-center gap-1 text-purple-600">
                        ✓ מחסן
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
