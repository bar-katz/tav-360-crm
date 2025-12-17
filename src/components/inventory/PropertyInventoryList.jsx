import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Home, DollarSign, Edit, Trash2, Phone, User, Wind, Archive, Car } from "lucide-react";

const categoryColors = {
  "פרטי": "bg-green-50 text-green-700 border-green-200",
  "מסחרי": "bg-blue-50 text-blue-700 border-blue-200"
};

export default function PropertyInventoryList({ properties, contacts, isLoading, onEdit, onDelete }) {
  const getContactById = (contactId) => {
    return contacts.find(c => c.id === contactId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6"><Skeleton className="h-24 w-full" /></Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Archive className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין נכסים במאגר</h3>
        <p className="text-slate-400">נכסים שיתווספו למאגר יופיעו כאן.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {properties.map((property, index) => {
          const contact = getContactById(property.contact_id);
          return (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          {property.property_type} ב{property.city}
                        </h3>
                        <Badge variant="outline" className={`${categoryColors[property.category]} border`}>
                          {property.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{property.street} {property.building_number}, {property.city}</span>
                        </div>
                        {property.rooms && (
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            <span>{property.rooms} חדרים</span>
                          </div>
                        )}
                        {property.price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{property.price.toLocaleString()} ₪</span>
                          </div>
                        )}
                      </div>

                      {contact && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <User className="w-4 h-4" />
                          <span>{contact.full_name}</span>
                          {contact.phone && (
                            <>
                              <Phone className="w-4 h-4 mr-1" />
                              <span>{contact.phone}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(property)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(property.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    {property.parking && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Car className="w-4 h-4" />
                        <span>חניה</span>
                      </div>
                    )}
                    {property.air_conditioning && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Wind className="w-4 h-4" />
                        <span>מזגן</span>
                      </div>
                    )}
                    {property.storage && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Archive className="w-4 h-4" />
                        <span>מחסן</span>
                      </div>
                    )}
                  </div>
                  {property.image_urls && property.image_urls.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {property.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`תמונת נכס ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-md shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}