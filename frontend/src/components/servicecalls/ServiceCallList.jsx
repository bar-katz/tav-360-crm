
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Phone, 
  User, 
  Building2, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  AlertTriangle,
  Wrench,
  UserCheck,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const statusOptions = ["קריאה חדשה", "בטיפול ספק", "קריאה טופלה", "לא רלוונטית"];
const statusColors = {
  "קריאה חדשה": "bg-blue-100 text-blue-800 border-blue-200",
  "בטיפול ספק": "bg-orange-100 text-orange-800 border-orange-200",
  "קריאה טופלה": "bg-green-100 text-green-800 border-green-200",
  "לא רלוונטית": "bg-gray-100 text-gray-800 border-gray-200"
};

const urgencyColors = {
  "נמוכה": "bg-gray-100 text-gray-800 border-gray-200",
  "בינונית": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "גבוהה": "bg-orange-100 text-orange-800 border-orange-200",
  "דחוף": "bg-red-100 text-red-800 border-red-200"
};

export default function ServiceCallList({ serviceCalls, contacts, properties, suppliers, isLoading, onEdit, onDelete, onStatusChange }) {
  const getContactById = (contactId) => contacts.find(c => c.id === contactId);
  const getPropertyById = (propertyId) => properties.find(p => p.id === propertyId);
  const getSupplierById = (supplierId) => suppliers.find(s => s.id === supplierId);

  // פונקציה לקבלת בעל הנכס - איש הקשר המשויך לנכס בניהול
  const getPropertyOwnerContact = (property) => {
    if (!property || !property.contact_id) return null;
    return contacts.find(c => c.id === property.contact_id);
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

  if (serviceCalls.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Phone className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין קריאות שירות להצגה</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף קריאה חדשה</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {serviceCalls.map((serviceCall, index) => {
          const contact = getContactById(serviceCall.contact_id);
          const property = getPropertyById(serviceCall.property_id);
          const supplier = getSupplierById(serviceCall.supplier_id);
          const propertyOwner = getPropertyOwnerContact(property);
          
          return (
            <motion.div
              key={serviceCall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900">
                          קריאה #{serviceCall.call_number || serviceCall.id.slice(-6)}
                        </h3>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className={`${statusColors[serviceCall.status]} border text-sm h-8 flex items-center gap-1`}
                            >
                              {serviceCall.status}
                              <ChevronDown className="w-4 h-4 opacity-70" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {statusOptions.map((status) => (
                              <DropdownMenuItem 
                                key={status} 
                                onClick={() => onStatusChange(serviceCall.id, status)}
                                disabled={serviceCall.status === status}
                              >
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Badge 
                          variant="outline"
                          className={`${urgencyColors[serviceCall.urgency]} border`}
                        >
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          {serviceCall.urgency}
                        </Badge>
                      </div>
                      
                      {/* תיאור הבעיה - בולט יותר */}
                      <div className="bg-slate-50 rounded-lg p-3 mb-4 border-r-4 border-blue-500">
                        <h4 className="font-semibold text-slate-800 mb-1 text-sm">תיאור הבעיה:</h4>
                        <p className="text-slate-700 leading-relaxed">
                          {serviceCall.description}
                        </p>
                      </div>

                      {/* פרטי הדייר עם טלפון */}
                      {contact && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-slate-800">{contact.full_name}</span>
                          {contact.phone && (
                            <>
                              <Phone className="w-3 h-3 text-slate-500 mr-2" />
                              <a 
                                href={`tel:${contact.phone}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {contact.phone}
                              </a>
                            </>
                          )}
                        </div>
                      )}

                      {/* פרטי הנכס ובעל הנכס */}
                      {property && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-lg">
                          <Building2 className="w-4 h-4 text-green-600" />
                          <span className="text-slate-700">
                            {property.property_type} ב{property.city}
                            {property.street && ` - ${property.street}`}
                            {property.building_number && ` ${property.building_number}`}
                            {property.apartment_number && ` דירה ${property.apartment_number}`}
                          </span>
                          {propertyOwner && (
                            <>
                              <UserCheck className="w-3 h-3 text-slate-500 mr-2" />
                              <span className="text-slate-600 text-sm">
                                בעלים: <span className="font-medium">{propertyOwner.full_name}</span>
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* ספק */}
                      {supplier && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 rounded-lg">
                          <Wrench className="w-4 h-4 text-orange-600" />
                          <span className="text-slate-700">{supplier.name} - {supplier.specialization}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <span>בטיפול: {serviceCall.handler}</span>
                        </div>
                        {serviceCall.total_cost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{serviceCall.total_cost.toLocaleString()} ₪</span>
                          </div>
                        )}
                        {serviceCall.work_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(serviceCall.work_date), 'dd/MM/yyyy', { locale: he })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(serviceCall)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(serviceCall.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {serviceCall.notes && (
                  <CardContent>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">הערות:</h4>
                      <p className="text-slate-600 text-sm">{serviceCall.notes}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
