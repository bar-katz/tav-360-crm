import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Save, X, Users, Loader2 } from "lucide-react";
import { BuyersBrokerage } from "@/api/entities";

const requestCategories = ["קנייה", "השכרה"];
const propertyTypes = ["דירה", "בית פרטי", "משרד"];
const areas = ["צפון תל אביב", "נווה צדק"];
const roomOptions = ["1", "2", "3", "4", "5", "6", "7"];
const sources = ["מאגר", "פייסבוק", "פה לאוזן"];
const statuses = ["קונה חדש", "אין מענה", "פולואפ", "נקבעה פגישה", "נחתם הסכם תיווך"];

export default function BuyersForm({ buyer, contacts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    handler: '',
    source: 'מאגר',
    status: 'קונה חדש',
    request_category: 'קנייה',
    desired_property_type: 'דירה',
    city: '',
    desired_area: '',
    budget: '',
    desired_rooms: '',
    parking: false,
    air_conditioning: false,
    storage: false
  });

  useEffect(() => {
    if (buyer) {
      setFormData({ 
        ...buyer, 
        budget: buyer.budget || '',
        desired_property_type: buyer.desired_property_type || 'דירה' // Ensure default value
      });
    }
  }, [buyer]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        budget: formData.budget ? parseInt(formData.budget) : null
      };

      if (buyer) {
        await BuyersBrokerage.update(buyer.id, dataToSubmit);
      } else {
        await BuyersBrokerage.create(dataToSubmit);
      }

      onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error submitting buyer:", error);
      alert("שגיאה בשמירת הקונה. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            {buyer ? 'עריכת קונה' : 'קונה חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_id">איש קשר *</Label>
                <Select required value={formData.contact_id} onValueChange={(value) => handleInputChange('contact_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר איש קשר" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.full_name}
                      </SelectItem>
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
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_category">קטגוריית ביקוש *</Label>
                <Select required value={formData.request_category} onValueChange={(value) => handleInputChange('request_category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {requestCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired_property_type">סוג נכס מבוקש</Label>
                <Select value={formData.desired_property_type} onValueChange={(value) => handleInputChange('desired_property_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired_area">אזור מבוקש</Label>
                <Select value={formData.desired_area} onValueChange={(value) => handleInputChange('desired_area', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר אזור" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">תקציב מבוקש</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="תקציב בשקלים"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired_rooms">מספר חדרים מבוקש</Label>
                <Select value={formData.desired_rooms} onValueChange={(value) => handleInputChange('desired_rooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="מספר חדרים" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
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
                    {sources.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
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

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                <Save className="w-4 h-4 ml-2" />
                {buyer ? 'עדכן קונה' : 'צור קונה'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}