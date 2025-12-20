import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, UserPlus } from "lucide-react";

const sources = ["מאגר", "פייסבוק", "פה לאוזן"];
const statuses = ["מתעניין חדש", "אין מענה", "פולואפ", "נקבעה פגישה", "שליחת הסכם שכירות", "נחתם הסכם שכירות"];

export default function TenantsForm({ tenant, contacts, properties, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    handler: '',
    current_property_id: '',
    source: 'מאגר',
    status: 'מתעניין חדש',
    lease_start_date: '',
    lease_end_date: '',
    monthly_rent: '',
    city: ''
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        contact_id: tenant.contact_id || '',
        handler: tenant.handler || '',
        current_property_id: tenant.current_property_id || '',
        source: tenant.source || 'מאגר',
        status: tenant.status || 'מתעניין חדש',
        lease_start_date: tenant.lease_start_date || '',
        lease_end_date: tenant.lease_end_date || '',
        monthly_rent: tenant.monthly_rent || '',
        city: tenant.city || ''
      });
    }
  }, [tenant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : null,
    };
    
    onSubmit(dataToSubmit);
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
            <UserPlus className="w-5 h-5 text-blue-600" />
            {tenant ? 'עריכת דייר' : 'דייר חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_id">איש קשר *</Label>
                <Select value={formData.contact_id} onValueChange={(value) => handleInputChange('contact_id', value)} required>
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
                <Label htmlFor="handler">מטפל</Label>
                <Input
                  id="handler"
                  value={formData.handler}
                  onChange={(e) => handleInputChange('handler', e.target.value)}
                  placeholder="שם המטפל"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_property_id">נכס בו הדייר גר *</Label>
                <Select value={formData.current_property_id} onValueChange={(value) => handleInputChange('current_property_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר נכס" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.property_type} ב{property.city} - {property.street} {property.building_number}
                        {property.apartment_number && ` דירה ${property.apartment_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">מקור הגעה</Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="monthly_rent">שכר דירה חודשי</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  step="0.01"
                  value={formData.monthly_rent}
                  onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lease_start_date">תאריך תחילת חוזה</Label>
                <Input
                  id="lease_start_date"
                  type="date"
                  value={formData.lease_start_date}
                  onChange={(e) => handleInputChange('lease_start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lease_end_date">תאריך סיום חוזה</Label>
                <Input
                  id="lease_end_date"
                  type="date"
                  value={formData.lease_end_date}
                  onChange={(e) => handleInputChange('lease_end_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="עיר"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {tenant ? 'עדכן דייר' : 'צור דייר'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}