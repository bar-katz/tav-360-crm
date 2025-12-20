import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Target } from "lucide-react";

const statuses = ["מתעניין חדש", "אין מענה", "פולואפ", "נקבעה פגישה", "סגר עסקה"];
const sources = ["מאגר", "פייסבוק", "פה לאוזן"];

export default function ProjectLeadsForm({ lead, contacts, projects, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    interested_project_id: '',
    handler: '',
    source: 'מאגר',
    status: 'מתעניין חדש',
    total_deal_price: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        contact_id: lead.contact_id || '',
        interested_project_id: lead.interested_project_id || '',
        handler: lead.handler || '',
        source: lead.source || 'מאגר',
        status: lead.status || 'מתעניין חדש',
        total_deal_price: lead.total_deal_price || ''
      });
    }
  }, [lead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      total_deal_price: formData.total_deal_price ? Number(formData.total_deal_price) : null
    };
    onSubmit(dataToSend);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {lead ? 'עריכת ליד' : 'ליד חדש לפרויקט'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_id">איש קשר *</Label>
                <Select value={formData.contact_id} onValueChange={(value) => handleInputChange('contact_id', value)} required>
                  <SelectTrigger id="contact_id"><SelectValue placeholder="בחר איש קשר" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => <SelectItem key={contact.id} value={contact.id}>{contact.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interested_project_id">פרויקט מתעניין *</Label>
                <Select value={formData.interested_project_id} onValueChange={(value) => handleInputChange('interested_project_id', value)} required>
                  <SelectTrigger id="interested_project_id"><SelectValue placeholder="בחר פרויקט" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(project => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source">מקור הגעה</Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger id="source"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handler">בטיפול של</Label>
                <Input id="handler" value={formData.handler} onChange={(e) => handleInputChange('handler', e.target.value)} placeholder="שם המטפל" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_deal_price">מחיר עסקה</Label>
                <Input id="total_deal_price" type="number" value={formData.total_deal_price} onChange={(e) => handleInputChange('total_deal_price', e.target.value)} placeholder="סכום סופי" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 ml-2" />ביטול</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 ml-2" />{lead ? 'עדכן ליד' : 'צור ליד'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}