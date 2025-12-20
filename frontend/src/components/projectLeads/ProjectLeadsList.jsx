import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building, Phone, Mail, Edit, Trash2, Target, DollarSign } from "lucide-react";

const statusColors = {
  "מתעניין חדש": "bg-blue-100 text-blue-800 border-blue-200",
  "אין מענה": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "פולואפ": "bg-purple-100 text-purple-800 border-purple-200",
  "נקבעה פגישה": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "סגר עסקה": "bg-green-100 text-green-800 border-green-200",
};

export default function ProjectLeadsList({ leads, contacts, projects, isLoading, onEdit, onDelete }) {
  const getContactById = (id) => contacts.find(c => c.id === id);
  const getProjectById = (id) => projects.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Target className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין לידים להצגה</h3>
        <p className="text-slate-400">לידים שיתווספו יופיעו כאן</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {leads.map((lead, index) => {
          const contact = getContactById(lead.contact_id);
          const project = getProjectById(lead.interested_project_id);
          return (
            <motion.div
              key={lead.id}
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
                          <h3 className="text-xl font-bold text-slate-900">{contact?.full_name || "איש קשר לא ידוע"}</h3>
                          {project && <p className="text-slate-600">מתעניין בפרויקט: {project.name}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`${statusColors[lead.status]} border`}>{lead.status}</Badge>
                        <Badge variant="secondary">{lead.source}</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-600">
                        {contact?.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-600" /><span>{contact.phone}</span></div>}
                        {contact?.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /><span>{contact.email}</span></div>}
                      </div>

                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(lead)} className="hover:bg-blue-50 hover:text-blue-600"><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => onDelete(lead.id)} className="hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      {lead.total_deal_price && (
                        <div className="flex items-center gap-1 text-green-700 font-semibold mt-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{lead.total_deal_price.toLocaleString()} ₪</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-sm text-slate-500">
                    {lead.handler && <span>בטיפול: {lead.handler}</span>}
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