import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Calendar } from "lucide-react";

const meetingTypes = ["זום", "פרונטאלי", "תצוגת נכס"];
const statuses = ["נקבעה", "התקיימה", "בוטלה", "נדחתה"];

export default function MeetingForm({ meeting, contacts, properties, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    property_id: '',
    client_id: '',
    handler: '',
    start_date: '',
    end_date: '',
    reminder_date: '',
    location: '',
    meeting_type: 'פרונטאלי',
    status: 'נקבעה',
    notes: ''
  });

  useEffect(() => {
    if (meeting) {
      // Convert dates to datetime-local format
      const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        ...meeting,
        start_date: formatDateTime(meeting.start_date),
        end_date: formatDateTime(meeting.end_date),
        reminder_date: formatDateTime(meeting.reminder_date)
      });
    }
  }, [meeting]);

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
            <Calendar className="w-5 h-5 text-blue-600" />
            {meeting ? 'עריכת פגישה' : 'פגישה חדשה'}
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
                <Label htmlFor="handler">נציג</Label>
                <Input
                  id="handler"
                  value={formData.handler}
                  onChange={(e) => handleInputChange('handler', e.target.value)}
                  placeholder="שם הנציג"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_type">סוג פגישה</Label>
                <Select value={formData.meeting_type} onValueChange={(value) => handleInputChange('meeting_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
                <Label htmlFor="start_date">תאריך ושעת התחלה</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">תאריך ושעת סיום</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
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
                <Label htmlFor="location">מיקום</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="מיקום הפגישה"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="הערות על הפגישה..."
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
                {meeting ? 'עדכן פגישה' : 'צור פגישה'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}