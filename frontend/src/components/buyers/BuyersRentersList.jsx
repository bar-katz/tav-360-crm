import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { User, Edit, Trash2, Phone, Mail, Home, DollarSign, MapPin } from "lucide-react";

const statusColors = {
  "ליד חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "נקבעה פגישה": "bg-purple-100 text-purple-800 border-purple-200",
  "סגר עסקה": "bg-green-100 text-green-800 border-green-200",
};

const requestTypeColors = {
  "קנייה": "bg-teal-50 text-teal-700 border-teal-200",
  "שכירות": "bg-amber-50 text-amber-700 border-amber-200"
};

export default function BuyersRentersList({ buyers, contacts, isLoading, onEdit, onDelete }) {
  const getContactById = (contactId) => contacts.find(c => c.id === contactId);

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
        <h3 className="text-xl font-semibold text-slate-600 mb-2">לא נמצאו קונים/שוכרים</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף ליד חדש.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {buyers.map((buyer, index) => {
          const contact = getContactById(buyer.contact_id);
          return (
            <motion.div
              key={buyer.id}
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
                        <h3 className="text-xl font-bold text-slate-900">{contact?.full_name || 'ליד ללא שם'}</h3>
                        <Badge variant="outline" className={`${statusColors[buyer.status]} border`}>{buyer.status}</Badge>
                        <Badge variant="outline" className={`${requestTypeColors[buyer.request_type]} border`}>{buyer.request_type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-2">
                        {buyer.preferred_property_type && <div className="flex items-center gap-1"><Home className="w-4 h-4" /><span>{buyer.preferred_property_type}</span></div>}
                        {buyer.preferred_area && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{buyer.preferred_area}</span></div>}
                        {buyer.budget && <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>עד {buyer.budget.toLocaleString()} ₪</span></div>}
                      </div>
                      {contact && (
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {contact.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4" /><span>{contact.phone}</span></div>}
                          {contact.email && <div className="flex items-center gap-1"><Mail className="w-4 h-4" /><span>{contact.email}</span></div>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(buyer)} className="hover:bg-blue-50 hover:text-blue-600"><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(buyer.id)} className="hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
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