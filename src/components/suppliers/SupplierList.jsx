import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  DollarSign,
  Star
} from "lucide-react";

const specializationColors = {
  "אינסטלציה": "bg-blue-100 text-blue-800 border-blue-200",
  "מזגנים": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "חשמל": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "צביעה": "bg-purple-100 text-purple-800 border-purple-200",
  "נקיון": "bg-green-100 text-green-800 border-green-200",
  "מטבח": "bg-orange-100 text-orange-800 border-orange-200",
  "אחר": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function SupplierList({ suppliers, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
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

  if (suppliers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Wrench className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין ספקים להצגה</h3>
        <p className="text-slate-400">נסה לשנות את החיפוש או להוסיף ספק חדש</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {suppliers.map((supplier, index) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md h-full">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {supplier.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`${specializationColors[supplier.specialization] || specializationColors['אחר']} border mb-3`}
                    >
                      <Wrench className="w-3 h-3 ml-1" />
                      {supplier.specialization}
                    </Badge>
                    
                    {supplier.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < supplier.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm text-slate-600 mr-2">
                          ({supplier.rating}/5)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(supplier)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(supplier.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </div>

                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{supplier.email}</span>
                    </div>
                  )}

                  {supplier.hourly_rate && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{supplier.hourly_rate} ₪/שעה</span>
                    </div>
                  )}

                  {supplier.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">{supplier.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}