import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function ProjectLeadsFilters({ filters, onFiltersChange, leads }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const getUniqueValues = (field) => [...new Set(leads.map(lead => lead[field]).filter(Boolean))];

  const statuses = ["מתעניין חדש", "אין מענה", "פולואפ", "נקבעה פגישה", "סגר עסקה"];
  const sources = ["מאגר", "פייסבוק", "פה לאוזן"];

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Filter className="w-5 h-5 text-blue-600" />סינון לידים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">סטטוס</label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">מקור הגעה</label>
          <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {sources.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}