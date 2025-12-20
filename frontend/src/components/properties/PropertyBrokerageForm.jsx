import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { PropertyBrokerage } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { X, Loader2 } from "lucide-react";
import { Contact } from '@/api/entities';

export default function PropertyBrokerageForm({ property, contacts, onSubmit, onCancel }) {
  const [currentProperty, setCurrentProperty] = useState(property || {
    contact_id: "",
    handler: "",
    source: "מאגר",
    status: "נכס חדש",
    category: "פרטי",
    listing_type: "מכירה",
    property_type: "דירה",
    price: "",
    city: "",
    area: "",
    street: "",
    building_number: "",
    apartment_number: "",
    rooms: "",
    floor: "",
    total_floors: "",
    parking: false,
    air_conditioning: false,
    storage: false,
    image_urls: []
  });

  const [isUploading, setIsUploading] = useState(false);
  const [contactName, setContactName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Populate contact name for editing
    if (property && property.contact_id && contacts.length > 0) {
      const contact = contacts.find(c => c.id === property.contact_id);
      if (contact) {
        setContactName(contact.full_name);
      } else {
        // If property has a contact_id but it's not in the provided contacts list
        // (e.g., deleted or not yet fetched), clear contactName to prevent stale data.
        setContactName('');
      }
    } else {
        setContactName('');
    }
  }, [property, contacts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim()) {
      alert("שדה 'איש קשר' הוא חובה.");
      return;
    }
    setIsSubmitting(true);

    try {
      let finalContactId;
      const existingContact = contacts.find(c => c.full_name.trim().toLowerCase() === contactName.trim().toLowerCase());

      if (existingContact) {
        finalContactId = existingContact.id;
      } else {
        const newContact = await Contact.create({ full_name: contactName.trim() });
        finalContactId = newContact.id;
      }
      
      const dataToSubmit = { 
        ...currentProperty, 
        contact_id: finalContactId, 
        price: currentProperty.price ? parseInt(currentProperty.price, 10) : null 
      };
      
      if (property) {
        await PropertyBrokerage.update(property.id, dataToSubmit);
      } else {
        await PropertyBrokerage.create(dataToSubmit);
      }
      
      onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error submitting property:", error);
      alert("שגיאה בשמירת הנכס. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBooleanChange = (field, checked) => {
    setCurrentProperty(prev => ({ ...prev, [field]: checked }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await UploadFile({ file: file });
        uploadedUrls.push(file_url);
      }
      setCurrentProperty(prev => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), ...uploadedUrls]
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("שגיאה בהעלאת התמונה. אנא נסה שוב.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = (indexToDelete) => {
    setCurrentProperty(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, index) => index !== indexToDelete)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* איש קשר */}
          <div>
            <Label htmlFor="contact_name">איש קשר</Label>
            <Input
              id="contact_name"
              list="contacts-list"
              placeholder="הקלד שם חדש או בחר מהרשימה"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <datalist id="contacts-list">
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.full_name} />
              ))}
            </datalist>
          </div>

          {/* מקור הגעה */}
          <div>
            <Label htmlFor="source">מקור הגעה</Label>
            <Select
              value={currentProperty.source}
              onValueChange={(value) => setCurrentProperty({...currentProperty, source: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="מאגר">מאגר</SelectItem>
                <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                <SelectItem value="פה לאוזן">פה לאוזן</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* סטטוס */}
          <div>
            <Label htmlFor="status">סטטוס</Label>
            <Select
              value={currentProperty.status}
              onValueChange={(value) => setCurrentProperty({...currentProperty, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="נכס חדש">נכס חדש</SelectItem>
                <SelectItem value="אין מענה">אין מענה</SelectItem>
                <SelectItem value="פולואפ">פולואפ</SelectItem>
                <SelectItem value="נכס גויס">נכס גויס</SelectItem>
                <SelectItem value="נכס פורסם">נכס פורסם</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* קטגוריית נכס */}
          <div>
            <Label htmlFor="category">קטגוריית נכס</Label>
            <Select
              value={currentProperty.category}
              onValueChange={(value) => setCurrentProperty({...currentProperty, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="פרטי">פרטי</SelectItem>
                <SelectItem value="מסחרי">מסחרי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* סוג עסקה - שדה חדש */}
          <div>
            <Label htmlFor="listing_type">סוג עסקה</Label>
            <Select
              value={currentProperty.listing_type}
              onValueChange={(value) => setCurrentProperty({...currentProperty, listing_type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג עסקה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="מכירה">מכירה</SelectItem>
                <SelectItem value="השכרה">השכרה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* סוג נכס */}
          <div>
            <Label htmlFor="property_type">סוג נכס</Label>
            <Select
              value={currentProperty.property_type}
              onValueChange={(value) => setCurrentProperty({...currentProperty, property_type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג נכס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="דירה">דירה</SelectItem>
                <SelectItem value="בית פרטי">בית פרטי</SelectItem>
                <SelectItem value="משרד">משרד</SelectItem>
                <SelectItem value="פנטהאוז">פנטהאוז</SelectItem>
                <SelectItem value="דירת גן">דירת גן</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* מחיר */}
          <div>
            <Label htmlFor="price">מחיר מבוקש</Label>
            <Input
              type="number"
              placeholder="מחיר בשקלים"
              value={currentProperty.price}
              onChange={(e) => setCurrentProperty({...currentProperty, price: e.target.value})}
            />
          </div>

          {/* עיר */}
          <div>
            <Label htmlFor="city">עיר</Label>
            <Input
              placeholder="עיר"
              value={currentProperty.city}
              onChange={(e) => setCurrentProperty({...currentProperty, city: e.target.value})}
            />
          </div>

          {/* אזור */}
          <div>
            <Label htmlFor="area">אזור</Label>
            <Select
              value={currentProperty.area}
              onValueChange={(value) => setCurrentProperty({...currentProperty, area: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר אזור" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="צפון תל אביב">צפון תל אביב</SelectItem>
                <SelectItem value="נווה צדק">נווה צדק</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* רחוב */}
          <div>
            <Label htmlFor="street">רחוב</Label>
            <Input
              placeholder="רחוב"
              value={currentProperty.street}
              onChange={(e) => setCurrentProperty({...currentProperty, street: e.target.value})}
            />
          </div>

          {/* מספר בית */}
          <div>
            <Label htmlFor="building_number">מספר בית</Label>
            <Input
              placeholder="מספר בית"
              value={currentProperty.building_number}
              onChange={(e) => setCurrentProperty({...currentProperty, building_number: e.target.value})}
            />
          </div>

          {/* מספר דירה */}
          <div>
            <Label htmlFor="apartment_number">מספר דירה</Label>
            <Input
              placeholder="מספר דירה"
              value={currentProperty.apartment_number}
              onChange={(e) => setCurrentProperty({...currentProperty, apartment_number: e.target.value})}
            />
          </div>

          {/* חדרים */}
          <div>
            <Label htmlFor="rooms">מספר חדרים</Label>
            <Select
              value={currentProperty.rooms}
              onValueChange={(value) => setCurrentProperty({...currentProperty, rooms: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר מספר חדרים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* קומה */}
          <div>
            <Label htmlFor="floor">קומה</Label>
            <Input
              placeholder="קומה"
              value={currentProperty.floor}
              onChange={(e) => setCurrentProperty({...currentProperty, floor: e.target.value})}
            />
          </div>

          {/* מתוך קומות */}
          <div>
            <Label htmlFor="total_floors">מתוך קומות</Label>
            <Input
              placeholder="סה״כ קומות בבניין"
              value={currentProperty.total_floors}
              onChange={(e) => setCurrentProperty({...currentProperty, total_floors: e.target.value})}
            />
          </div>
        </div>

        {/* אפשרויות נוספות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="parking"
              checked={currentProperty.parking}
              onCheckedChange={(checked) => handleBooleanChange('parking', checked)}
            />
            <Label htmlFor="parking">חניה</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="air_conditioning"
              checked={currentProperty.air_conditioning}
              onCheckedChange={(checked) => handleBooleanChange('air_conditioning', checked)}
            />
            <Label htmlFor="air_conditioning">מזגן</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="storage"
              checked={currentProperty.storage}
              onCheckedChange={(checked) => handleBooleanChange('storage', checked)}
            />
            <Label htmlFor="storage">מחסן</Label>
          </div>
        </div>

        {/* העלאת תמונות */}
        <div className="space-y-2">
          <Label htmlFor="image_upload">תמונות הנכס</Label>
          <Input
            id="image_upload"
            type="file"
            multiple
            onChange={handleImageUpload}
            disabled={isUploading}
            className="cursor-pointer"
          />
          {isUploading && (
            <div className="flex items-center text-slate-500">
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              מעלה תמונות...
            </div>
          )}
          {currentProperty.image_urls && currentProperty.image_urls.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {currentProperty.image_urls.map((url, index) => (
                <div key={index} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={url} alt={`נכס ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageDelete(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            {property ? 'עדכן נכס' : 'צור נכס'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}