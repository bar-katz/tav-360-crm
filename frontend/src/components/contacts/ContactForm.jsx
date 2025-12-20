import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Save, X, User } from "lucide-react";

export default function ContactForm({ contact, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    whatsapp_id: '',
    address: '',
    city: '',
    whatsapp_link: '',
    notes: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({ ...contact });
    }
  }, [contact]);

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
            <User className="w-5 h-5 text-blue-600" />
            {contact ? 'עריכת איש קשר' : 'איש קשר חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">שם מלא *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="הכנס שם מלא"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון ראשי</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="050-1234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">דואר אלקטרוני</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_id">מזהה ווטסאפ</Label>
                <Input
                  id="whatsapp_id"
                  value={formData.whatsapp_id}
                  onChange={(e) => handleInputChange('whatsapp_id', e.target.value)}
                  placeholder="מספר טלפון לווטסאפ"
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
                <Label htmlFor="whatsapp_link">קישור לווטסאפ</Label>
                <Input
                  id="whatsapp_link" 
                  type="url"
                  value={formData.whatsapp_link}
                  onChange={(e) => handleInputChange('whatsapp_link', e.target.value)}
                  placeholder="https://wa.me/972501234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">כתובת</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="רחוב, מספר בית, עיר"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="הערות נוספות על איש הקשר..."
                className="h-32"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {contact ? 'עדכן איש קשר' : 'צור איש קשר'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}