import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function ServiceCallFilters({ filters, onFiltersChange, serviceCalls }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getUniqueValues = (field) => {
    return [...new Set(serviceCalls.map(sc => sc[field]).filter(Boolean))];
  };

  const filterCounts = {
    all: serviceCalls.length,
    by_status: serviceCalls.reduce((acc, sc) => {
      acc[sc.status] = (acc[sc.status] || 0) + 1;
      return acc;
    }, {}),
    by_urgency: serviceCalls.reduce((acc, sc) => {
      acc[sc.urgency] = (acc[sc.urgency] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון קריאות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">סטטוס</label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center justify-between w-full">
                  <span>הכל</span>
                  <Badge variant="outline" className="mr-2">{filterCounts.all}</Badge>
                </div>
              </SelectItem>
              {getUniqueValues('status').map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center justify-between w-full">
                    <span>{status}</span>
                    <Badge variant="outline" className="mr-2">
                      {filterCounts.by_status[status] || 0}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">דחיפות</label>
          <Select value={filters.urgency} onValueChange={(value) => handleFilterChange('urgency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center justify-between w-full">
                  <span>הכל</span>
                  <Badge variant="outline" className="mr-2">{filterCounts.all}</Badge>
                </div>
              </SelectItem>
              {getUniqueValues('urgency').map((urgency) => (
                <SelectItem key={urgency} value={urgency}>
                  <div className="flex items-center justify-between w-full">  
                    <span>{urgency}</span>
                    <Badge variant="outline" className="mr-2">
                      {filterCounts.by_urgency[urgency] || 0}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}