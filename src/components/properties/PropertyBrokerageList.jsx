
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Home, DollarSign, Edit, Trash2, Phone, User, Building, Wind, Archive, Car, Clock } from "lucide-react";
import { PropertyBrokerage } from "@/api/entities";
import { User as UserEntity } from '@/api/entities';
import { formatDistanceToNow } from 'date-fns'; // This import is no longer strictly needed for getTimeSinceCreated, but keeping for now as it's not explicitly removed.
import { he } from 'date-fns/locale'; // This import is no longer strictly needed for getTimeSinceCreated, but keeping for now as it's not explicitly removed.

const statusColors = {
  "נכס חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "גויס": "bg-green-100 text-green-800 border-green-200",
  "פורסם": "bg-purple-100 text-purple-800 border-purple-200",
};

const categoryColors = {
  "פרטי": "bg-teal-50 text-teal-700 border-teal-200",
  "מסחרי": "bg-amber-50 text-amber-700 border-amber-200"
};

export default function PropertyBrokerageList({ properties, contacts, isLoading, onEdit, onDelete }) {
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await UserEntity.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const getContactById = (contactId) => {
    return contacts.find(c => c.id === contactId);
  };

  const handleSecureDelete = async (propertyId) => {
    try {
      if (!confirm("האם אתה בטוח שברצונך למחוק את הנכס?")) return;
      
      await PropertyBrokerage.delete(propertyId);
      onDelete(propertyId);
    } catch (error) {
      alert("שגיאה במחיקת הנכס");
    }
  };

  const getTimeSinceCreated = (createdDate) => {
    if (!createdDate) return '';
    try {
      // Parse the date and explicitly handle timezone
      const now = new Date();
      const created = new Date(createdDate);
      
      // Calculate difference in milliseconds
      const diffMs = now.getTime() - created.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) {
        return 'ממש עכשיו';
      } else if (diffMinutes < 60) {
        return `לפני ${diffMinutes} דקות`;
      } else if (diffHours < 24) {
        return `לפני ${diffHours} שעות`;
      } else {
        return `לפני ${diffDays} ימים`;
      }
    } catch (e) {
      console.error("Invalid date for getTimeSinceCreated:", createdDate);
      return '';
    }
  };

  const canEdit = currentUser && currentUser.app_role && (currentUser.app_role === 'admin' || currentUser.app_role === 'office_manager');
  const canDelete = currentUser && currentUser.app_role === 'admin';

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
        <Building className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">לא נמצאו נכסים</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף נכס חדש.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {properties.map((property, index) => {
          const owner = getContactById(property.contact_id);
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
                        <Badge variant="outline" className={`${statusColors[property.status]} border`}>{property.status}</Badge>
                        <Badge variant="outline" className={`${categoryColors[property.category]} border`}>{property.category}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{property.street} {property.building_number}, {property.city}</span></div>
                        {property.rooms && (<div className="flex items-center gap-1"><Home className="w-4 h-4" /><span>{property.rooms} חדרים</span></div>)}
                        {property.price && (<div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>{property.price.toLocaleString()} ₪</span></div>)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {owner && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" /><span>{owner.full_name}</span>
                            {owner.phone && (<><Phone className="w-4 h-4 mr-1" /><span>{owner.phone}</span></>)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>נוצר {getTimeSinceCreated(property.created_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(property)} className="hover:bg-blue-50 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="outline" size="sm" onClick={() => handleSecureDelete(property.id)} className="hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    {property.parking && <div className="flex items-center gap-1 text-green-600"><Car className="w-4 h-4" /><span>חניה</span></div>}
                    {property.air_conditioning && <div className="flex items-center gap-1 text-blue-600"><Wind className="w-4 h-4" /><span>מזגן</span></div>}
                    {property.storage && <div className="flex items-center gap-1 text-purple-600"><Archive className="w-4 h-4" /><span>מחסן</span></div>}
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
