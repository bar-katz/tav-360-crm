import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Users } from "lucide-react";

const statuses = ["ליד חדש", "נקבעה פגישה", "סגר עסקה"];
const requestTypes = ["קנייה", "שכירות"];
const propertyTypes = ["דירה", "בית", "משרד"];
const areas = ["נווה צדק", "צפון תל אביב", "פלורנטין", "רוטשילד", "דיזנגוף", "יפו העתיקה", "נחלת בנימין"];
const roomOptions = ["1", "2", "3", "4", "5", "6", "7"];
const sources = ["פה לאוזן", "פייסבוק", "טופס"];

export default function BuyersRentersForm({ buyer, contacts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    status: 'ליד חדש',
    request_type: 'קנייה',
    preferred_area: '',
    preferred_property_type: 'דירה',
    preferred_rooms: '',
    budget: '',
    source: 'טופס'
  });

  useEffect(() => {
    if (buyer) {
      setFormData({ ...buyer, budget: buyer.budget || '' });
    }
  }, [buyer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({...formData, budget: formData.budget ? parseInt(formData.budget) : null});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-lg border-0">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />{buyer ? 'עריכת קונה/שוכר' : 'ליד חדש'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2"><Label htmlFor="contact_id">איש קשר *</Label><Select required value={formData.contact_id} onValueChange={(v) => handleInputChange('contact_id', v)}><SelectTrigger><SelectValue placeholder="בחר איש קשר" /></SelectTrigger><SelectContent>{contacts.map((c) => (<SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="status">סטטוס</Label><Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="request_type">סוג בקשה</Label><Select value={formData.request_type} onValueChange={(v) => handleInputChange('request_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{requestTypes.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="preferred_property_type">סוג נכס רצוי</Label><Select value={formData.preferred_property_type} onValueChange={(v) => handleInputChange('preferred_property_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyTypes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="preferred_area">אזור רצוי</Label><Select value={formData.preferred_area} onValueChange={(v) => handleInputChange('preferred_area', v)}><SelectTrigger><SelectValue placeholder="בחר אזור" /></SelectTrigger><SelectContent>{areas.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="preferred_rooms">מספר חדרים</Label><Select value={formData.preferred_rooms} onValueChange={(v) => handleInputChange('preferred_rooms', v)}><SelectTrigger><SelectValue placeholder="בחר מספר חדרים" /></SelectTrigger><SelectContent>{roomOptions.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="budget">תקציב</Label><Input id="budget" type="number" value={formData.budget} onChange={(e) => handleInputChange('budget', e.target.value)} placeholder="תקציב מקסימלי" /></div>
              <div className="space-y-2"><Label htmlFor="source">מקור הגעה</Label><Select value={formData.source} onValueChange={(v) => handleInputChange('source', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sources.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 ml-2" />ביטול</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 ml-2" />{buyer ? 'עדכן' : 'צור ליד'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}