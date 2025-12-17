import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Phone } from "lucide-react";
import { Tenant } from "@/api/entities";

const statuses = ["קריאה חדשה", "בטיפול ספק", "קריאה טופלה", "לא רלוונטית"];
const urgencyLevels = ["נמוכה", "בינונית", "גבוהה", "דחוף"];

export default function ServiceCallForm({ serviceCall, contacts, properties, suppliers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    property_id: '',
    supplier_id: '',
    handler: '',
    call_number: '',
    status: 'קריאה חדשה',
    description: '',
    urgency: 'בינונית',
    total_cost: '',
    work_date: '',
    notes: ''
  });

  const [tenants, setTenants] = useState([]);
  const [isPropertyAutoFilled, setIsPropertyAutoFilled] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (serviceCall) {
      setFormData({ 
        ...serviceCall,
        total_cost: serviceCall.total_cost || ''
      });
    } else {
      // Generate call number for new service calls
      const callNumber = `SC${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, call_number: callNumber }));
    }
  }, [serviceCall]);

  const loadTenants = async () => {
    try {
      const tenantsData = await Tenant.list();
      setTenants(tenantsData);
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      total_cost: formData.total_cost ? parseFloat(formData.total_cost) : null,
    };
    
    onSubmit(dataToSubmit);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (contactId) => {
    handleInputChange('contact_id', contactId);
    
    // Find if this contact is a tenant and auto-fill property
    const tenant = tenants.find(t => t.contact_id === contactId);
    if (tenant && tenant.current_property_id) {
      handleInputChange('property_id', tenant.current_property_id);
      setIsPropertyAutoFilled(true);
    } else {
      handleInputChange('property_id', '');
      setIsPropertyAutoFilled(false);
    }
  };

  // Get contact display with tenant indication
  const getContactDisplay = (contact) => {
    const tenant = tenants.find(t => t.contact_id === contact.id);
    const baseDisplay = `${contact.full_name}${contact.phone ? ` - ${contact.phone}` : ''}`;
    return tenant ? `${baseDisplay} (דייר)` : baseDisplay;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            {serviceCall ? 'עריכת קריאת שירות' : 'קריאת שירות חדשה'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="call_number">מספר קריאה</Label>
                <Input
                  id="call_number"
                  value={formData.call_number}
                  onChange={(e) => handleInputChange('call_number', e.target.value)}
                  placeholder="מספר קריאה"
                  disabled
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
                <Label htmlFor="contact_id">איש קשר *</Label>
                <Select value={formData.contact_id} onValueChange={handleContactChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר איש קשר" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {getContactDisplay(contact)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_id">נכס</Label>
                <Select 
                  value={formData.property_id} 
                  onValueChange={(value) => {
                    handleInputChange('property_id', value);
                    setIsPropertyAutoFilled(false);
                  }}
                  disabled={isPropertyAutoFilled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isPropertyAutoFilled ? "נבחר אוטומטית לפי הדייר" : "בחר נכס"} />
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
                {isPropertyAutoFilled && (
                  <p className="text-xs text-blue-600">הנכס נבחר אוטומטית על בסיס הדייר שנבחר</p>
                )}
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
                <Label htmlFor="urgency">דחיפות</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((urgency) => (
                      <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_id">ספק</Label>
                <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange('supplier_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר ספק" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_cost">עלות כוללת</Label>
                <Input
                  id="total_cost"
                  type="number"
                  step="0.01"
                  value={formData.total_cost}
                  onChange={(e) => handleInputChange('total_cost', e.target.value)}
                  placeholder="עלות בשקלים"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_date">תאריך עבודה</Label>
                <Input
                  id="work_date"
                  type="date"
                  value={formData.work_date}
                  onChange={(e) => handleInputChange('work_date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור הבעיה *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תאר את הבעיה או התקלה..."
                className="h-24"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="הערות נוספות..."
                className="h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {serviceCall ? 'עדכן קריאה' : 'צור קריאה'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}