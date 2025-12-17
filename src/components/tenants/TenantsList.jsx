
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building, Phone, Mail, Edit, Trash2, MapPin, UserPlus, Building2, DollarSign, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const statusColors = {
  "מתעניין חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "אין מענה": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "פולואפ": "bg-purple-100 text-purple-800 border-purple-200",
  "נקבעה פגישה": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "שליחת הסכם שכירות": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "נחתם הסכם שכירות": "bg-green-100 text-green-800 border-green-200",
};

export default function TenantsList({ tenants, contacts, properties, isLoading, onEdit, onDelete }) {
  const getContactById = (contactId) => contacts.find(c => c.id === contactId);
  const getPropertyById = (propertyId) => properties.find(p => p.id === propertyId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6"><Skeleton className="h-24 w-full" /></Card>
        ))}
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <Card className="p-12 text-center">
        <UserPlus className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין דיירים להצגה</h3>
        <p className="text-slate-400">דיירים שיתווספו למערכת יופיעו כאן</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tenants.map((tenant, index) => {
          const contact = getContactById(tenant.contact_id);
          const property = getPropertyById(tenant.current_property_id);
          
          return (
            <motion.div
              key={tenant.id}
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
                          {contact?.full_name || 'לא זוהה'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[tenant.status] || ''} border`}
                        >
                          {tenant.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        {contact?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {property && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-slate-600" />
                            <span>
                              {property.property_type} ב{property.city} - {property.street} {property.building_number}
                              {property.apartment_number && ` דירה ${property.apartment_number}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {tenant.handler && (
                          <div className="flex items-center gap-1">
                            <span>מטפל: {tenant.handler}</span>
                          </div>
                        )}
                        {tenant.monthly_rent && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-700" />
                            <span>{tenant.monthly_rent.toLocaleString()} ₪/חודש</span>
                          </div>
                        )}
                        {tenant.lease_end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-700" />
                            <span>חוזה עד: {format(new Date(tenant.lease_end_date), 'dd/MM/yyyy', { locale: he })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(tenant)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(tenant.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
