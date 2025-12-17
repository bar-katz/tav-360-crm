import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Edit, 
  Trash2, 
  Phone, 
  User,
  Car,
  Wind,
  Archive
} from "lucide-react";

const statusColors = {
  "נכס חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "אין מענה": "bg-yellow-100 text-yellow-800 border-yellow-200", 
  "פולואפ": "bg-orange-100 text-orange-800 border-orange-200",
  "נכס גויס": "bg-green-100 text-green-800 border-green-200",
  "נכס פורסם": "bg-purple-100 text-purple-800 border-purple-200",
  "נסגר": "bg-gray-100 text-gray-800 border-gray-200"
};

const categoryColors = {
  "פרטי": "bg-green-50 text-green-700 border-green-200",
  "מסחרי": "bg-blue-50 text-blue-700 border-blue-200"
};

export default function PropertyList({ properties, contacts, isLoading, onEdit, onDelete }) {
  const getContactById = (contactId) => {
    return contacts.find(c => c.id === contactId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
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

  if (properties.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Home className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין נכסים להצגה</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף נכס חדש</p>
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
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          {property.property_type} ב{property.city}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[property.status]} border`}
                        >
                          {property.status}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`${categoryColors[property.category]} border`}
                        >
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(property)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(property.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-4">
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

                    {property.square_meters && (
                      <div className="mr-auto text-slate-600">
                        <span className="font-medium">{property.square_meters} מ"ר</span>
                      </div>
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