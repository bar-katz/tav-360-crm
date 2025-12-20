import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function ProjectsFilters({ filters, onFiltersChange, projects }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getUniqueValues = (field) => {
    return [...new Set(projects.map(p => p[field]).filter(Boolean))];
  };

  const filterCounts = {
    all: projects.length,
    by_status: projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון פרויקטים
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
          <label className="text-sm font-medium mb-2 block">עיר</label>
          <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('city').map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">בטיפול של</label>
          <Select value={filters.handler} onValueChange={(value) => handleFilterChange('handler', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('handler').map((handler) => (
                <SelectItem key={handler} value={handler}>{handler}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}