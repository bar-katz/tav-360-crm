import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Building2 } from "lucide-react";

const statuses = ["פתוח לדיירים", "נסגר"];

export default function ProjectsForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    handler: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    status: 'פתוח לדיירים',
    city: '',
    area: '',
    apartment_type_1: '',
    apartment_type_2: '',
    apartment_type_3: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    }
  }, [project]);

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
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">שם פרויקט *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="שם הפרויקט"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handler">בטיפול של *</Label>
                <Input
                  id="handler"
                  value={formData.handler}
                  onChange={(e) => handleInputChange('handler', e.target.value)}
                  placeholder="שם המטפל"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">עיר *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="עיר"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">אזור</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="אזור"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס פרויקט</Label>
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
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">פרטי איש קשר בפרויקט</Label>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">שם איש קשר</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="שם איש קשר"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">טלפון איש קשר</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="מספר טלפון"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">דואר אלקטרוני</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="כתובת אימייל"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">סוגי דירות בפרויקט</Label>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apartment_type_1">סוג דירה ראשון</Label>
                  <Input
                    id="apartment_type_1"
                    value={formData.apartment_type_1}
                    onChange={(e) => handleInputChange('apartment_type_1', e.target.value)}
                    placeholder="לדוגמה: 3 חדרים"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment_type_2">סוג דירה שני</Label>
                  <Input
                    id="apartment_type_2"
                    value={formData.apartment_type_2}
                    onChange={(e) => handleInputChange('apartment_type_2', e.target.value)}
                    placeholder="לדוגמה: 4 חדרים"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment_type_3">סוג דירה שלישי</Label>
                  <Input
                    id="apartment_type_3"
                    value={formData.apartment_type_3}
                    onChange={(e) => handleInputChange('apartment_type_3', e.target.value)}
                    placeholder="לדוגמה: 5 חדרים"
                  />
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
                {project ? 'עדכן פרויקט' : 'צור פרויקט'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}