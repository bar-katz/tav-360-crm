import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function PropertyBrokerageFilters({ filters, onFiltersChange, properties, category }) {
  const getUniqueValues = (field) => [...new Set(properties.map(p => p[field]).filter(Boolean))].sort();

  const uniqueStatuses = getUniqueValues('status');
  const uniqueCities = getUniqueValues('city');
  const propertyTypes = ["דירה", "בית פרטי", "משרד", "פנטהאוז", "דירת גן"];
  const roomOptions = ["1", "2", "3", "4", "5", "6", "7"];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          סינון נכסים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* סטטוס - תמיד מוצג */}
        <div>
          <Label className="text-sm font-medium mb-2 block">סטטוס</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="כל הסטטוסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* עיר - תמיד מוצג */}
        <div>
          <Label className="text-sm font-medium mb-2 block">עיר</Label>
          <Select
            value={filters.city || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, city: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="כל הערים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הערים</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* פילטרים ספציפיים למגורים בלבד */}
        {category === "מגורים" && (
          <>
            {/* סוג נכס */}
            <div>
              <Label className="text-sm font-medium mb-2 block">סוג נכס</Label>
              <Select
                value={filters.property_type || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="כל סוגי הנכסים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל סוגי הנכסים</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* חדרים */}
            <div>
              <Label className="text-sm font-medium mb-2 block">חדרים</Label>
              <Select
                value={filters.rooms || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, rooms: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="כל מספרי החדרים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל מספרי החדרים</SelectItem>
                  {roomOptions.map((room) => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* סטטיסטיקות */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm text-slate-700 mb-2">סטטיסטיקות</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">סה״כ נכסים:</span>
              <span className="font-medium">{properties.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}