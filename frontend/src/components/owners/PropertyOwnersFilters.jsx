import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

export default function PropertyOwnersFilters({ filters, onFiltersChange, owners }) {
  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  // חישוב סטטיסטיקות לפילטרים
  const statusCounts = owners.reduce((acc, owner) => {
    acc[owner.status || 'לא מוגדר'] = (acc[owner.status || 'לא מוגדר'] || 0) + 1;
    return acc;
  }, {});

  const propertyTypeCounts = owners.reduce((acc, owner) => {
    acc[owner.property_type || 'לא מוגדר'] = (acc[owner.property_type || 'לא מוגדר'] || 0) + 1;
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
              <SelectItem value="all">כל הסטטוסים ({owners.length})</SelectItem>
              <SelectItem value="נכס חדש">נכס חדש ({statusCounts['נכס חדש'] || 0})</SelectItem>
              <SelectItem value="אין מענה">אין מענה ({statusCounts['אין מענה'] || 0})</SelectItem>
              <SelectItem value="פולואפ">פולואפ ({statusCounts['פולואפ'] || 0})</SelectItem>
              <SelectItem value="נחתם הסכם ניהול">נחתם הסכם ניהול ({statusCounts['נחתם הסכם ניהול'] || 0})</SelectItem>
              <SelectItem value="נכס פורסם">נכס פורסם ({statusCounts['נכס פורסם'] || 0})</SelectItem>
              <SelectItem value="נחתם הסכם שכירות">נחתם הסכם שכירות ({statusCounts['נחתם הסכם שכירות'] || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            סוג נכס
          </label>
          <Select 
            value={filters.property_type} 
            onValueChange={(value) => handleFilterChange('property_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="כל הסוגים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים ({owners.length})</SelectItem>
              <SelectItem value="דירה">דירה ({propertyTypeCounts['דירה'] || 0})</SelectItem>
              <SelectItem value="בית פרטי">בית פרטי ({propertyTypeCounts['בית פרטי'] || 0})</SelectItem>
              <SelectItem value="משרד">משרד ({propertyTypeCounts['משרד'] || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-slate-700 mb-3">סיכום מהיר</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">סה"כ בעלי נכסים:</span>
              <Badge variant="secondary">{owners.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">נכסים פעילים:</span>
              <Badge className="bg-green-100 text-green-800">
                {(statusCounts['נחתם הסכם ניהול'] || 0) + (statusCounts['נחתם הסכם שכירות'] || 0)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">ממתינים לטיפול:</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {(statusCounts['נכס חדש'] || 0) + (statusCounts['פולואפ'] || 0)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}