import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function TenantsFilters({ filters, onFiltersChange, tenants }) {
  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const statusCounts = tenants.reduce((acc, tenant) => {
    acc[tenant.status || 'לא מוגדר'] = (acc[tenant.status || 'לא מוגדר'] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="w-5 h-5 text-blue-600" />
          פילטרים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            סטטוס
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים ({tenants.length})</SelectItem>
              {Object.entries(statusCounts).map(([status, count]) => (
                <SelectItem key={status} value={status}>{status} ({count})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-slate-700 mb-3">סיכום</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">סה"כ דיירים:</span>
              <Badge variant="secondary">{tenants.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">חתמו חוזה:</span>
              <Badge className="bg-green-100 text-green-800">
                {statusCounts['נחתם הסכם שכירות'] || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">מתעניינים חדשים:</span>
              <Badge className="bg-blue-100 text-blue-800">
                {statusCounts['מתעניין חדש'] || 0}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}