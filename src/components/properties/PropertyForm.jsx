import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Save, X, Building2 } from "lucide-react";

const propertyTypes = ["דירה", "בית פרטי", "משרד", "מחסן", "חנות"];
const categories = ["פרטי", "מסחרי"];
const statuses = ["נכס חדש", "אין מענה", "פולואפ", "נכס גויס", "נכס פורסם", "נסגר"];
const areas = ["צפון תל אביב", "נווה צדק", "פלורנטין", "רוטשילד", "דיזנגוף"];
const roomOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6+"];

export default function PropertyForm({ property, contacts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    handler: '',
    source: 'מאגר',
    status: 'נכס חדש',
    category: 'פרטי',
    property_type: 'דירה',
    price: '',
    city: '',
    area: '',
    street: '',
    building_number: '',
    apartment_number: '',
    rooms: '',
    floor: '',
    total_floors: '',
    parking: false,
    air_conditioning: false,
    storage: false,
    square_meters: '',
    balcony: false,
    elevator: false
  });

  useEffect(() => {
    if (property) {
      setFormData({ ...property });
    }
  }, [property]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {property ? 'עריכת נכס' : 'נכס חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_id">איש קשר</Label>
                <Select value={formData.contact_id} onValueChange={(value) => handleInputChange('contact_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר איש קשר" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.full_name} {contact.phone && `- ${contact.phone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handler">בטיפול של</Label>
                <Input
                  id="handler"
                  value={formData.handler}
                  onChange={(e) => handleInputChange('handler', e.target.value)}
                  placeholder="שם המטפל"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">סוג נכס</Label>
                <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">מחיר</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                  placeholder="מחיר בשקלים"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="שם העיר"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">אזור</Label>
                <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר אזור" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">רחוב</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="שם הרחוב"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building_number">מספר בית</Label>
                <Input
                  id="building_number"
                  value={formData.building_number}
                  onChange={(e) => handleInputChange('building_number', e.target.value)}
                  placeholder="מספר הבית"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">חדרים</Label>
                <Select value={formData.rooms} onValueChange={(value) => handleInputChange('rooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="מספר חדרים" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((room) => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="square_meters">מ"ר</Label>
                <Input
                  id="square_meters"
                  type="number"
                  value={formData.square_meters}
                  onChange={(e) => handleInputChange('square_meters', parseInt(e.target.value))}
                  placeholder="שטח במטר רבוע"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">מאפיינים נוספים</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="parking"
                    checked={formData.parking}
                    onCheckedChange={(checked) => handleInputChange('parking', checked)}
                  />
                  <Label htmlFor="parking">חניה</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="air_conditioning"
                    checked={formData.air_conditioning}
                    onCheckedChange={(checked) => handleInputChange('air_conditioning', checked)}
                  />
                  <Label htmlFor="air_conditioning">מזגן</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="storage"
                    checked={formData.storage}
                    onCheckedChange={(checked) => handleInputChange('storage', checked)}
                  />
                  <Label htmlFor="storage">מחסן</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="elevator"
                    checked={formData.elevator}
                    onCheckedChange={(checked) => handleInputChange('elevator', checked)}
                  />
                  <Label htmlFor="elevator">מעלית</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {property ? 'עדכן נכס' : 'צור נכס'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}