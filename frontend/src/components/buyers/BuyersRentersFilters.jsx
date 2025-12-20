import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function BuyersRentersFilters({ filters, onFiltersChange, buyers }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const getUniqueValues = (field) => [...new Set(buyers.map(b => b[field]).filter(Boolean))];

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5 text-blue-600" />סינון קונים/שוכרים</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><label className="text-sm font-medium mb-2 block">סטטוס</label><Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">הכל</SelectItem>{getUniqueValues('status').map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
        <div><label className="text-sm font-medium mb-2 block">סוג בקשה</label><Select value={filters.request_type} onValueChange={(v) => handleFilterChange('request_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">הכל</SelectItem>{getUniqueValues('request_type').map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select></div>
        <div><label className="text-sm font-medium mb-2 block">סוג נכס</label><Select value={filters.property_type} onValueChange={(v) => handleFilterChange('preferred_property_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">הכל</SelectItem>{getUniqueValues('preferred_property_type').map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
      </CardContent>
    </Card>
  );
}