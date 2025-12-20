import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, CheckSquare } from "lucide-react";

const priorities = ["נמוכה", "בינונית", "גבוהה", "דחוף"];
const statuses = ["חדשה", "בביצוע", "הושלמה", "נדחתה"];

export default function TaskForm({ task, contacts, properties, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    due_date: '',
    priority: 'בינונית',
    status: 'חדשה',
    contact_id: '',
    property_id: '',
    client_id: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    }
  }, [task]);

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
            <CheckSquare className="w-5 h-5 text-blue-600" />
            {task ? 'עריכת משימה' : 'משימה חדשה'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת המשימה</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="כותרת המשימה"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">מופקד עליה</Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => handleInputChange('assignee', e.target.value)}
                  placeholder="שם המופקד על המשימה"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">עדיפות</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
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
                <Label htmlFor="due_date">תאריך יעד</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_id">איש קשר קשור</Label>
                <Select value={formData.contact_id} onValueChange={(value) => handleInputChange('contact_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר איש קשר (אופציונלי)" />
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
                <Label htmlFor="property_id">נכס קשור</Label>
                <Select value={formData.property_id} onValueChange={(value) => handleInputChange('property_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר נכס (אופציונלי)" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.property_type} ב{property.city} - {property.street} {property.building_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">לקוח קשור</Label>
                <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר לקוח (אופציונלי)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => {
                      const contact = contacts.find(c => c.id === client.contact_id);
                      return (
                        <SelectItem key={client.id} value={client.id}>
                          {contact?.full_name || 'לקוח ללא פרטי קשר'} - {client.property_type}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור המשימה</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תאר את המשימה בפירוט..."
                className="h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {task ? 'עדכן משימה' : 'צור משימה'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}