import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function TaskFilters({ filters, onFiltersChange, tasks }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getUniqueValues = (field) => {
    return [...new Set(tasks.map(t => t[field]).filter(Boolean))];
  };

  const filterCounts = {
    all: tasks.length,
    by_status: tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {}),
    by_priority: tasks.reduce((acc, t) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <Card className="shadow-lg border-0 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון משימות
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
          <label className="text-sm font-medium mb-2 block">עדיפות</label>
          <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
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
              {getUniqueValues('priority').map((priority) => (
                <SelectItem key={priority} value={priority}>
                  <div className="flex items-center justify-between w-full">
                    <span>{priority}</span>
                    <Badge variant="outline" className="mr-2">
                      {filterCounts.by_priority[priority] || 0}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">מופקד</label>
          <Select value={filters.assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              {getUniqueValues('assignee').map((assignee) => (
                <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}