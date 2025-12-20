import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function PropertyInventoryFilters({ filters, onFiltersChange, properties }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getUniqueValues = (field) => {
    return [...new Set(properties.map(p => p[field]).filter(Boolean))];
  };

  const filterCounts = {
    all: properties.length,
    by_category: properties.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון מאגר נכסים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">קטגוריה</label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
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
              {getUniqueValues('category').map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center justify-between w-full">
                    <span>{category}</span>
                    <Badge variant="outline" className="mr-2">
                      {filterCounts.by_category[category] || 0}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">סוג נכס</label>
          <Select value={filters.property_type} onValueChange={(value) => handleFilterChange('property_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('property_type').map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">אזור</label>
          <Select value={filters.area} onValueChange={(value) => handleFilterChange('area', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('area').map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}