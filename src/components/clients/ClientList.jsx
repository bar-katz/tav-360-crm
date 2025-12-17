import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Home, 
  DollarSign, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  MapPin,
  Target
} from "lucide-react";

const statusColors = {
  "קונה חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "אין מענה": "bg-yellow-100 text-yellow-800 border-yellow-200", 
  "פולואפ": "bg-orange-100 text-orange-800 border-orange-200",
  "נקבעה פגישה": "bg-purple-100 text-purple-800 border-purple-200",
  "נחתם הסכם תיווך": "bg-green-100 text-green-800 border-green-200",
  "עסקה נסגרה": "bg-gray-100 text-gray-800 border-gray-200"
};

const categoryColors = {
  "קנייה": "bg-green-50 text-green-700 border-green-200",
  "השכרה": "bg-blue-50 text-blue-700 border-blue-200"
};

export default function ClientList({ clients, contacts, isLoading, onEdit, onDelete }) {
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

  if (clients.length === 0) {
    return (
      <Card className="p-12 text-center">
        <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין לקוחות להצגה</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף לקוח חדש</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {clients.map((client, index) => {
          const contact = getContactById(client.contact_id);
          
          return (
            <motion.div
              key={client.id}
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
                          {contact?.full_name || 'לקוח ללא פרטי קשר'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[client.status]} border`}
                        >
                          {client.status}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`${categoryColors[client.request_category]} border`}
                        >
                          {client.request_category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{client.property_type} ב{client.city}</span>
                        </div>
                        {client.rooms && (
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            <span>{client.rooms} חדרים</span>
                          </div>
                        )}
                        {client.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>עד {client.budget.toLocaleString()} ₪</span>
                          </div>
                        )}
                      </div>

                      {contact && (
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(client)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(client.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {client.area && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <MapPin className="w-4 h-4" />
                          <span>{client.area}</span>
                        </div>
                      )}
                      {client.handler && (
                        <div className="text-slate-600">
                          <span className="font-medium">בטיפול: {client.handler}</span>
                        </div>
                      )}
                    </div>
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