
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { format } from 'date-fns';

export default function MarketingLeadsList({ leads, selectedLeads, isLoading, onSelectLead, onSelectAll }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center border rounded-lg bg-white">
        <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">אין לידים להצגה</h3>
        <p className="text-slate-400">שנה את הסינון או ייבא קובץ חדש</p>
      </div>
    );
  }

  const allEligibleSelected = leads.length > 0 && leads
    .filter(lead => lead.opt_out_whatsapp !== "כן")
    .every(lead => selectedLeads.includes(lead.id));

  return (
    <div className="bg-white rounded-lg shadow-md border">
      {/* Header for Select All */}
      <div className="p-3 border-b flex items-center justify-between bg-slate-50/70 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={allEligibleSelected} 
            onCheckedChange={onSelectAll} 
            id="selectAll"
          />
          <label htmlFor="selectAll" className="font-medium text-sm cursor-pointer">
            בחר הכל ({leads.filter(l => l.opt_out_whatsapp !== "כן").length} זכאים)
          </label>
        </div>
        <span className="text-xs text-slate-500">
          נבחרו {selectedLeads.length} מתוך {leads.length} לידים
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b bg-slate-50/70 text-xs font-semibold text-slate-600 sticky top-0 z-10">
        <div className="col-span-1"></div> {/* Checkbox col */}
        <div className="col-span-3">שם</div>
        <div className="col-span-2">טלפון</div>
        <div className="col-span-2">סוג / שכונה</div>
        <div className="col-span-2">ת. ייבוא</div>
        <div className="col-span-2">נשלח לאחרונה</div>
      </div>

      {/* Table Body */}
      <AnimatePresence>
        {leads.map((lead) => {
          const isSelected = selectedLeads.includes(lead.id);
          const canSendWhatsApp = lead.opt_out_whatsapp !== "כן";
          return (
            <motion.div
              key={lead.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`grid grid-cols-12 gap-4 px-4 py-2 border-b items-center text-sm transition-colors ${
                isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
              } ${!canSendWhatsApp ? 'opacity-50 bg-slate-100' : ''}`}
            >
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelectLead(lead.id, checked)}
                  disabled={!canSendWhatsApp}
                />
              </div>
              <div className="col-span-3 font-medium text-slate-800 truncate" title={`${lead.first_name}`}>
                {lead.first_name}
              </div>
              <div className="col-span-2 text-slate-600">{lead.phone_number}</div>
              <div className="col-span-2 text-slate-600 text-xs">
                <div>{lead.client_type}</div>
                <div className="text-slate-500">{lead.neighborhood}</div>
              </div>
              <div className="col-span-2 text-slate-500 text-xs">
                {lead.import_date ? format(new Date(lead.import_date), 'dd/MM/yy') : '-'}
              </div>
              <div className="col-span-2 text-slate-500 text-xs">
                {lead.last_contacted ? format(new Date(lead.last_contacted), 'dd/MM/yy') : 'לא נשלח'}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
