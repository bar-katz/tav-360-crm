import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function BuyersFilters({ filters, onFiltersChange, buyers }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getUniqueValues = (field) => {
    return [...new Set(buyers.map(b => b[field]).filter(Boolean))];
  };

  const filterCounts = {
    all: buyers.length,
    by_status: buyers.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון קונים
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
          <label className="text-sm font-medium mb-2 block">קטגוריית ביקוש</label>
          <Select value={filters.request_category} onValueChange={(value) => handleFilterChange('request_category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('request_category').map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">סוג נכס מבוקש</label>
          <Select value={filters.desired_property_type} onValueChange={(value) => handleFilterChange('desired_property_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('desired_property_type').map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}