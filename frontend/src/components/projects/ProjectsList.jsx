import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";

const statusColors = {
  "פתוח לדיירים": "bg-green-100 text-green-800 border-green-200",
  "נסגר": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function ProjectsList({ projects, isLoading, onEdit, onDelete }) {
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

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין פרויקטים להצגה</h3>
        <p className="text-slate-400">פרויקטים שיתווספו יופיעו כאן</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
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
                        {project.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[project.status]} border`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{project.city}</span>
                        {project.area && <span>, {project.area}</span>}
                      </div>
                    </div>

                    {project.contact_name && (
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>איש קשר: {project.contact_name}</span>
                        {project.contact_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{project.contact_phone}</span>
                          </div>
                        )}
                        {project.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{project.contact_email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(project)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(project.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {project.apartment_type_1 && (
                    <div>
                      <span className="font-medium text-slate-600">סוג דירה 1:</span>
                      <span className="mr-2">{project.apartment_type_1}</span>
                    </div>
                  )}
                  {project.apartment_type_2 && (
                    <div>
                      <span className="font-medium text-slate-600">סוג דירה 2:</span>
                      <span className="mr-2">{project.apartment_type_2}</span>
                    </div>
                  )}
                  {project.apartment_type_3 && (
                    <div>
                      <span className="font-medium text-slate-600">סוג דירה 3:</span>
                      <span className="mr-2">{project.apartment_type_3}</span>
                    </div>
                  )}
                </div>
                
                {project.handler && (
                  <div className="mt-3 text-sm text-slate-500">
                    <span className="font-medium">בטיפול של:</span>
                    <span className="mr-2">{project.handler}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}