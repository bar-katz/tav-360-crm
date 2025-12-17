import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Edit, 
  Trash2, 
  Video,
  Home,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const statusColors = {
  "נקבעה": "bg-blue-100 text-blue-800 border-blue-200",
  "התקיימה": "bg-green-100 text-green-800 border-green-200",
  "בוטלה": "bg-red-100 text-red-800 border-red-200",
  "נדחתה": "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const typeIcons = {
  "זום": Video,
  "פרונטאלי": User,
  "תצוגת נכס": Building2
};

export default function MeetingList({ meetings, contacts, properties, clients, isLoading, onEdit, onDelete }) {
  const getContactById = (contactId) => contacts.find(c => c.id === contactId);
  const getPropertyById = (propertyId) => properties.find(p => p.id === propertyId);
  const getClientById = (clientId) => clients.find(c => c.id === clientId);

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

  if (meetings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין פגישות להצגה</h3>
        <p className="text-slate-400">נסה לשנות את החיפוש או להוסיף פגישה חדשה</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {meetings.map((meeting, index) => {
          const contact = getContactById(meeting.contact_id);
          const property = getPropertyById(meeting.property_id);
          const client = getClientById(meeting.client_id);
          const TypeIcon = typeIcons[meeting.meeting_type] || User;
          
          return (
            <motion.div
              key={meeting.id}
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
                        <TypeIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900">
                          פגישה - {meeting.meeting_type}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[meeting.status]} border`}
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(meeting.start_date), 'dd/MM/yyyy', { locale: he })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(meeting.start_date), 'HH:mm', { locale: he })}</span>
                          </div>
                        </div>

                        {meeting.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{meeting.location}</span>
                          </div>
                        )}

                        {contact && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{contact.full_name}</span>
                            {contact.phone && <span>- {contact.phone}</span>}
                          </div>
                        )}

                        {property && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{property.property_type} ב{property.city}</span>
                          </div>
                        )}

                        {meeting.handler && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">נציג: {meeting.handler}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(meeting)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(meeting.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {meeting.notes && (
                  <CardContent>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">הערות:</h4>
                      <p className="text-slate-600 text-sm">{meeting.notes}</p>
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