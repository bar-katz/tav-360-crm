
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, DollarSign, Edit, Trash2, Phone, User, Home, Clock, AlertTriangle } from "lucide-react";
import { BuyersBrokerage } from "@/api/entities";
import { User as UserEntity } from '@/api/entities';
import { formatDistanceToNow } from 'date-fns'; // This import is no longer strictly needed for getTimeSinceCreated but keeping it as it was in original file.
import { he } from 'date-fns/locale'; // This import is no longer strictly needed for getTimeSinceCreated but keeping it as it was in original file.

const statusColors = {
  "קונה חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "אין מענה": "bg-red-100 text-red-800 border-red-200",
  "פולואפ": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "נקבעה פגישה": "bg-green-100 text-green-800 border-green-200",
  "נחתם הסכם תיווך": "bg-purple-100 text-purple-800 border-purple-200"
};

const requestTypeColors = {
  "קנייה": "bg-green-50 text-green-700",
  "שכירות": "bg-blue-50 text-blue-700"
};

export default function BuyersList({ buyers, contacts, isLoading, onEdit, onDelete }) {
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

  const handleSecureDelete = async (buyerId) => {
    try {
      if (!confirm("האם אתה בטוח שברצונך למחוק את הקונה?")) return;
      
      await BuyersBrokerage.delete(buyerId);
      onDelete(buyerId);
    } catch (error) {
      alert("שגיאה במחיקת הקונה");
    }
  };

  const canEdit = currentUser && currentUser.app_role && (currentUser.app_role === 'admin' || currentUser.app_role === 'office_manager');
  const canDelete = currentUser && currentUser.app_role === 'admin';

  const getTimeSinceCreated = (createdDate) => {
    if (!createdDate) return '';
    try {
      // Debug: Let's see what we're getting
      console.log('Original createdDate string:', createdDate);
      
      const now = new Date();
      const created = new Date(createdDate); // This is just for logging the 'parsed' version before explicit UTC handling
      
      console.log('Current time (now):', now.toISOString());
      console.log('Created time (parsed):', created.toISOString());
      console.log('Timezone offset (minutes):', now.getTimezoneOffset());
      
      // Try to handle the timezone correctly
      // If the date string doesn't have timezone info, assume it's UTC
      let createdUTC;
      if (createdDate.includes('Z') || createdDate.includes('+') || createdDate.includes('T')) {
        // Date already has timezone info
        createdUTC = new Date(createdDate);
      } else {
        // Assume it's UTC and convert properly by appending 'Z'
        createdUTC = new Date(createdDate + 'Z');
      }
      
      console.log('Created time (UTC corrected):', createdUTC.toISOString());
      
      // Calculate difference in milliseconds
      const diffMs = now.getTime() - createdUTC.getTime();
      console.log('Difference in ms:', diffMs);
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      console.log('Diff minutes:', diffMinutes, 'Diff hours:', diffHours);
      
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
      console.error("Error calculating time since created:", e, "Original date:", createdDate);
      return 'זמן לא ידוע';
    }
  };

  const shouldShowAlert = (buyer) => {
    if (buyer.status !== "קונה חדש") return false;
    
    try {
      const now = new Date();
      let created;
      
      // Handle timezone the same way as in getTimeSinceCreated
      if (buyer.created_date.includes('Z') || buyer.created_date.includes('+') || buyer.created_date.includes('T')) {
        created = new Date(buyer.created_date);
      } else {
        created = new Date(buyer.created_date + 'Z');
      }
      
      const diffMs = now.getTime() - created.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      return diffHours >= 4; // התראה אחרי 4 שעות
    } catch (e) {
      console.error("Error in shouldShowAlert:", e);
      return false;
    }
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

  if (buyers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">לא נמצאו קונים</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף קונה חדש.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {buyers.map((buyer, index) => {
          const contact = getContactById(buyer.contact_id);
          const showAlert = shouldShowAlert(buyer);
          
          return (
            <motion.div
              key={buyer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
                showAlert ? 'ring-2 ring-red-200' : ''
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          {contact?.full_name || 'ללא איש קשר'}
                        </h3>
                        <Badge variant="outline" className={`${statusColors[buyer.status]} border`}>
                          {buyer.status}
                        </Badge>
                        {showAlert && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3 ml-1" />
                            דורש טיפול
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          <span>{buyer.desired_property_type}, {buyer.desired_rooms} חדרים</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{buyer.desired_area}</span>
                        </div>
                        {buyer.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{buyer.budget.toLocaleString()} ₪</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {contact?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>נוצר {getTimeSinceCreated(buyer.created_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {canEdit && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(buyer)} 
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSecureDelete(buyer.id)} 
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
