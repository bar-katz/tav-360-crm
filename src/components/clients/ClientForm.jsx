import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Save, X, Users } from "lucide-react";

const propertyTypes = ["דירה", "בית פרטי", "מחסן", "חנות"];
const categories = ["קנייה", "השכרה"];
const statuses = ["קונה חדש", "אין מענה", "פולואפ", "נקבעה פגישה", "נחתם הסכם תיווך", "עסקה נסגרה"];
const areas = ["צפון תל אביב", "נווה צדק", "פלורנטין", "רוטשילד", "דיזנגוף"];
const roomOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6+"];

export default function ClientForm({ client, contacts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    handler: '',
    source: 'מאגר',
    status: 'קונה חדש',
    request_category: 'קנייה',
    property_type: 'דירה',
    city: '',
    area: '',
    budget: '',
    rooms: '',
    parking: false,
    air_conditioning: false,
    storage: false
  });

  useEffect(() => {
    if (client) {
      setFormData({ ...client });
    }
  }, [client]);

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
            <Users className="w-5 h-5 text-blue-600" />
            {client ? 'עריכת לקוח' : 'לקוח חדש'}
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
                <Label htmlFor="request_category">סוג בקשה</Label>
                <Select value={formData.request_category} onValueChange={(value) => handleInputChange('request_category', value)}>
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
                <Label htmlFor="property_type">סוג נכס מבוקש</Label>
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
                <Label htmlFor="budget">תקציב</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                  placeholder="תקציב בשקלים"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">עיר מבוקשת</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="שם העיר"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">אזור מבוקש</Label>
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
                <Label htmlFor="rooms">מספר חדרים מבוקש</Label>
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
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">דרישות נוספות</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {client ? 'עדכן לקוח' : 'צור לקוח'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}