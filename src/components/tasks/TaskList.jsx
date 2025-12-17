import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Calendar,
  AlertTriangle,
  Building2,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const statusColors = {
  "חדשה": "bg-blue-100 text-blue-800 border-blue-200",
  "בביצוע": "bg-orange-100 text-orange-800 border-orange-200",
  "הושלמה": "bg-green-100 text-green-800 border-green-200",
  "נדחתה": "bg-gray-100 text-gray-800 border-gray-200"
};

const priorityColors = {
  "נמוכה": "bg-gray-100 text-gray-800 border-gray-200",
  "בינונית": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "גבוהה": "bg-orange-100 text-orange-800 border-orange-200",
  "דחוף": "bg-red-100 text-red-800 border-red-200"
};

const statusOptions = ["חדשה", "בביצוע", "הושלמה", "נדחתה"];

export default function TaskList({ tasks, contacts, properties, clients, isLoading, onEdit, onDelete, onStatusUpdate }) {
  const getContactById = (contactId) => contacts.find(c => c.id === contactId);
  const getPropertyById = (propertyId) => properties.find(p => p.id === propertyId);
  const getClientById = (clientId) => clients.find(c => c.id === clientId);

  const isOverdue = (task) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== "הושלמה";
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

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckSquare className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין משימות להצגה</h3>
        <p className="text-slate-400">נסה לשנות את הפילטרים או להוסיף משימה חדשה</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task, index) => {
          const contact = getContactById(task.contact_id);
          const property = getPropertyById(task.property_id);
          const client = getClientById(task.client_id);
          const overdue = isOverdue(task);
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
                overdue ? 'border-r-4 border-r-red-500' : ''
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckSquare className={`w-5 h-5 ${
                          task.status === 'הושלמה' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                        <h3 className={`text-xl font-bold ${
                          task.status === 'הושלמה' ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}>
                          {task.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[task.status]} border`}
                        >
                          {task.status}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`${priorityColors[task.priority]} border`}
                        >
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          {task.priority}
                        </Badge>
                        {overdue && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            באיחור
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-slate-700 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>מופקד: {task.assignee}</span>
                        </div>
                        
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>יעד: {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: he })}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {contact && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.full_name}</span>
                          </div>
                        )}
                        
                        {property && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{property.property_type} ב{property.city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => onStatusUpdate(task.id, e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded px-2 py-1"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(task)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(task.id)}
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