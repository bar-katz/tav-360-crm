
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Building, X, User } from "lucide-react";
import { Contact } from "@/api/entities"; // Assuming this path is correct

export default function PropertyOwnersForm({ owner, contacts, preSelectedContactId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: owner?.contact_id || preSelectedContactId || '',
    handler: owner?.handler || '',
    source: owner?.source || 'פה לאוזן',
    status: owner?.status || 'נכס חדש',
    property_type: owner?.property_type || 'דירה',
    management_fee: owner?.management_fee || '',
    lease_start_date: owner?.lease_start_date || '',
    lease_end_date: owner?.lease_end_date || '',
    city: owner?.city || '',
    area: owner?.area || '',
    street: owner?.street || '',
    building_number: owner?.building_number || '',
    apartment_number: owner?.apartment_number || '',
    rooms: owner?.rooms || '',
    floor: owner?.floor || '',
    total_floors: owner?.total_floors || '',
    parking: owner?.parking || false,
    air_conditioning: owner?.air_conditioning || false,
    storage: owner?.storage || false,
    ...owner
  });

  // פרטי איש הקשר
  const [contactData, setContactData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [isNewContact, setIsNewContact] = useState(false);

  useEffect(() => {
    // טעינת פרטי איש הקשר הנבחר או איפוס עבור חדש
    if (preSelectedContactId && contacts.length > 0) {
      // If a pre-selected contact exists, always use it and disable selection
      const selectedContact = contacts.find(c => c.id === preSelectedContactId);
      if (selectedContact) {
        setContactData({
          full_name: selectedContact.full_name || '',
          phone: selectedContact.phone || '',
          email: selectedContact.email || '',
          address: selectedContact.address || ''
        });
        setIsNewContact(false);
        setFormData(prev => ({ ...prev, contact_id: preSelectedContactId }));
      }
    } else if (formData.contact_id && contacts.length > 0) {
      // If an existing owner is being edited and has a contact_id
      const selectedContact = contacts.find(c => c.id === formData.contact_id);
      if (selectedContact) {
        setContactData({
          full_name: selectedContact.full_name || '',
          phone: selectedContact.phone || '',
          email: selectedContact.email || '',
          address: selectedContact.address || ''
        });
        setIsNewContact(false);
      } else {
        // If contact_id exists but contact not found (e.g., deleted), treat as new
        setContactData({ full_name: '', phone: '', email: '', address: '' });
        setIsNewContact(true);
        setFormData(prev => ({ ...prev, contact_id: '' }));
      }
    } else {
      // If no contact_id is set (e.g., creating a new property owner) or if it's explicitly 'new'
      setContactData({ full_name: '', phone: '', email: '', address: '' });
      setIsNewContact(true);
    }
  }, [owner, contacts, preSelectedContactId]); // Added owner to dependencies for initial load logic

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let contactId = formData.contact_id;

      // Handle contact creation/update
      if (isNewContact) {
        if (!contactData.full_name.trim()) {
          alert('שם מלא של איש קשר הוא שדה חובה.');
          return;
        }
        // Create new contact
        const newContact = await Contact.create({
          full_name: contactData.full_name.trim(),
          phone: contactData.phone.trim() || undefined,
          email: contactData.email.trim() || undefined,
          address: contactData.address.trim() || undefined
        });
        contactId = newContact.id;
      } else if (contactId) {
        // Update existing contact if there's a contactId and it's not a new contact
        if (!contactData.full_name.trim()) {
          alert('שם מלא של איש קשר הוא שדה חובה.');
          return;
        }
        await Contact.update(contactId, {
          full_name: contactData.full_name.trim(),
          phone: contactData.phone.trim() || undefined,
          email: contactData.email.trim() || undefined,
          address: contactData.address.trim() || undefined
        });
      }

      // Prepare property owner data for submission
      const dataToSubmit = {
        ...formData,
        contact_id: contactId, // Ensure the correct contact_id is set
        management_fee: formData.management_fee ? parseFloat(formData.management_fee) : null,
      };
      
      onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error saving contact or property owner:", error);
      alert("שגיאה בשמירת הנתונים: " + (error.message || "נסה שוב מאוחר יותר."));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSelection = (selectedContactId) => {
    if (selectedContactId === 'new') {
      setIsNewContact(true);
      setFormData(prev => ({ ...prev, contact_id: '' })); // Clear contact_id in form data
      setContactData({
        full_name: '',
        phone: '',
        email: '',
        address: ''
      });
    } else {
      setIsNewContact(false);
      handleChange('contact_id', selectedContactId);
      const selectedContact = contacts.find(c => c.id === selectedContactId);
      if (selectedContact) {
        setContactData({
          full_name: selectedContact.full_name || '',
          phone: selectedContact.phone || '',
          email: selectedContact.email || '',
          address: selectedContact.address || ''
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building className="w-6 h-6 text-blue-600" />
              {owner ? 'עריכת בעל נכס' : 'בעל נכס חדש'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* פרטי איש קשר */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <User className="w-5 h-5 text-blue-600" />
                פרטי בעל הנכס
              </h3>
              
              <div className="grid md:grid-cols-1 gap-4 mb-4">
                <div>
                  <Label htmlFor="contact_selection">בחירת איש קשר</Label>
                  <Select 
                    value={isNewContact ? 'new' : (formData.contact_id || 'new')} 
                    onValueChange={handleContactSelection}
                    disabled={!!preSelectedContactId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר איש קשר או צור חדש" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ איש קשר חדש</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {preSelectedContactId && (
                    <p className="text-xs text-slate-500 mt-1">
                      איש קשר נבחר מראש - לא ניתן לשנות בתצוגה זו
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">שם מלא *</Label>
                  <Input
                    id="contact_name"
                    value={contactData.full_name}
                    onChange={(e) => handleContactChange('full_name', e.target.value)}
                    placeholder="שם מלא של בעל הנכס"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">מספר טלפון</Label>
                  <Input
                    id="contact_phone"
                    value={contactData.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="05X-XXXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">כתובת מייל</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={contactData.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_address">כתובת מגורים</Label>
                  <Input
                    id="contact_address"
                    value={contactData.address}
                    onChange={(e) => handleContactChange('address', e.target.value)}
                    placeholder="כתובת מגורים של בעל הנכס"
                  />
                </div>
              </div>
            </div>

            {/* פרטי הנכס */}
            <div className="border rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Building className="w-5 h-5 text-green-600" />
                פרטי הנכס
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="handler">בטיפול של</Label>
                  <Input
                    id="handler"
                    value={formData.handler}
                    onChange={(e) => handleChange('handler', e.target.value)}
                    placeholder="שם המטפל"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label>מקור הגעה</Label>
                  <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                      <SelectItem value="פה לאוזן">פה לאוזן</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>סטטוס</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="נכס חדש">נכס חדש</SelectItem>
                      <SelectItem value="אין מענה">אין מענה</SelectItem>
                      <SelectItem value="פולואפ">פולואפ</SelectItem>
                      <SelectItem value="נחתם הסכם ניהול">נחתם הסכם ניהול</SelectItem>
                      <SelectItem value="נכס פורסם">נכס פורסם</SelectItem>
                      <SelectItem value="נחתם הסכם שכירות">נחתם הסכם שכירות</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>סוג הנכס</Label>
                  <Select value={formData.property_type} onValueChange={(value) => handleChange('property_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="דירה">דירה</SelectItem>
                      <SelectItem value="בית פרטי">בית פרטי</SelectItem>
                      <SelectItem value="משרד">משרד</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="management_fee">דמי ניהול</Label>
                  <Input
                    id="management_fee"
                    type="number"
                    step="0.01"
                    value={formData.management_fee}
                    onChange={(e) => handleChange('management_fee', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="lease_start_date">תאריך תחילת חוזה שכירות</Label>
                  <Input
                    id="lease_start_date"
                    type="date"
                    value={formData.lease_start_date}
                    onChange={(e) => handleChange('lease_start_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="lease_end_date">תאריך סיום חוזה שכירות</Label>
                  <Input
                    id="lease_end_date"
                    type="date"
                    value={formData.lease_end_date}
                    onChange={(e) => handleChange('lease_end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="city">עיר</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="תל אביב"
                  />
                </div>

                <div>
                  <Label>אזור</Label>
                  <Select value={formData.area} onValueChange={(value) => handleChange('area', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר אזור" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="צפון תל אביב">צפון תל אביב</SelectItem>
                      <SelectItem value="נווה צדק">נווה צדק</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="street">רחוב</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    placeholder="דיזנגוף"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mt-4">
                <div>
                  <Label htmlFor="building_number">מספר בית</Label>
                  <Input
                    id="building_number"
                    value={formData.building_number}
                    onChange={(e) => handleChange('building_number', e.target.value)}
                    placeholder="123"
                  />
                </div>

                <div>
                  <Label htmlFor="apartment_number">מספר דירה</Label>
                  <Input
                    id="apartment_number"
                    value={formData.apartment_number}
                    onChange={(e) => handleChange('apartment_number', e.target.value)}
                    placeholder="4"
                  />
                </div>

                <div>
                  <Label>מספר חדרים</Label>
                  <Select value={formData.rooms} onValueChange={(value) => handleChange('rooms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="floor">קומה</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => handleChange('floor', e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="total_floors">מתוך קומות</Label>
                <Input
                  id="total_floors"
                  value={formData.total_floors}
                  onChange={(e) => handleChange('total_floors', e.target.value)}
                  placeholder="5"
                  className="w-32"
                />
              </div>

              <div className="flex gap-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={formData.parking}
                    onCheckedChange={(checked) => handleChange('parking', checked)}
                  />
                  <Label htmlFor="parking">חניה</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="air_conditioning"
                    checked={formData.air_conditioning}
                    onCheckedChange={(checked) => handleChange('air_conditioning', checked)}
                  />
                  <Label htmlFor="air_conditioning">מזגן</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="storage"
                    checked={formData.storage}
                    onCheckedChange={(checked) => handleChange('storage', checked)}
                  />
                  <Label htmlFor="storage">מחסן</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {owner ? 'עדכן' : 'הוסף'} בעל נכס
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
