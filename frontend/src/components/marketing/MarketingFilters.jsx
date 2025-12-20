import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function MarketingFilters({ filters, onFiltersChange, leads }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const getUniqueValues = (field) => [...new Set(leads.map(lead => lead[field]).filter(Boolean))];

  const filterCounts = {
    all: leads.length,
    eligible: leads.filter(lead => lead.opt_out_whatsapp !== "כן").length,
    by_client_type: leads.reduce((acc, lead) => {
      acc[lead.client_type] = (acc[lead.client_type] || 0) + 1;
      return acc;
    }, {}),
    by_seriousness: leads.reduce((acc, lead) => {
      acc[lead.seriousness] = (acc[lead.seriousness] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון לידים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">סיכום</div>
          <div className="space-y-1 text-sm text-blue-800">
            <div>סה"כ לידים: {filterCounts.all}</div>
            <div className="font-medium">זכאים לדיוור: {filterCounts.eligible}</div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">סוג לקוח</label>
          <Select value={filters.client_type} onValueChange={(value) => handleFilterChange('client_type', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center justify-between w-full">
                  <span>הכל</span>
                  <Badge variant="outline" className="mr-2">{filterCounts.all}</Badge>
                </div>
              </SelectItem>
              {getUniqueValues('client_type').map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center justify-between w-full">
                    <span>{type}</span>
                    <Badge variant="outline" className="mr-2">{filterCounts.by_client_type[type] || 0}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">שכונה</label>
          <Select value={filters.neighborhood} onValueChange={(value) => handleFilterChange('neighborhood', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('neighborhood').map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">רצינות</label>
          <Select value={filters.seriousness} onValueChange={(value) => handleFilterChange('seriousness', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="רציני">רציני ({filterCounts.by_seriousness['רציני'] || 0})</SelectItem>
              <SelectItem value="רגיל">רגיל ({filterCounts.by_seriousness['רגיל'] || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">דיוור</label>
          <Select value={filters.opt_out} onValueChange={(value) => handleFilterChange('opt_out', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="לא">מסכימים לדיוור ({filterCounts.eligible})</SelectItem>
              <SelectItem value="כן">לא רוצים דיוור ({filterCounts.all - filterCounts.eligible})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}