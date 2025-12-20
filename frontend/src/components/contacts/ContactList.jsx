import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2,
  MessageCircle,
  ExternalLink
} from "lucide-react";

export default function ContactList({ contacts, isLoading, onEdit, onDelete }) {
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

  if (contacts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין אנשי קשר להצגה</h3>
        <p className="text-slate-400">נסה לשנות את החיפוש או להוסיף איש קשר חדש</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {contacts.map((contact, index) => (
          <motion.div
            key={contact.id}
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {contact.full_name}
                        </h3>
                        {contact.city && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-4 h-4" />
                            <span>{contact.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-green-600" />
                          <a href={`tel:${contact.phone}`} className="hover:text-blue-600 transition-colors">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      
                      {contact.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a href={`mailto:${contact.email}`} className="hover:text-blue-600 transition-colors">
                            {contact.email}
                          </a>
                        </div>
                      )}

                      {contact.whatsapp_link && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          <a 
                            href={contact.whatsapp_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-green-600 transition-colors"
                          >
                            <span>ווטסאפ</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {contact.address && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{contact.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(contact)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(contact.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {contact.notes && (
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">הערות:</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}