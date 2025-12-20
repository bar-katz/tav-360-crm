
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Save, X as XIcon, Archive, Loader2, X } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { Contact } from '@/api/entities'; // New import for Contact entity

const propertyTypes = ["דירה", "בית פרטי", "משרד"];
const categories = ["פרטי", "מסחרי"];
const areas = ["צפון תל אביב", "נווה צדק"];
const roomOptions = ["1", "2", "3", "4", "5", "6", "7"];

export default function PropertyInventoryForm({ property, contacts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    contact_id: '',
    handler: '',
    source: 'מאגר',
    category: 'פרטי',
    property_type: 'דירה',
    price: '',
    city: '',
    area: '',
    street: '',
    building_number: '',
    apartment_number: '',
    rooms: '',
    floor: '',
    total_floors: '',
    parking: false,
    air_conditioning: false,
    storage: false,
    image_urls: []
  });

  const [contactName, setContactName] = useState(''); // New state for contact name input
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading
  const [isUploading, setIsUploading] = useState(false); // Existing state for image upload

  useEffect(() => {
    if (property) {
      setFormData({ ...property, price: property.price || '', image_urls: property.image_urls || [] });
      // Set contactName from property if available
      if (property.contact_id && contacts.length > 0) {
        const contact = contacts.find(c => c.id === property.contact_id);
        if (contact) {
          setContactName(contact.full_name);
        } else {
          setContactName(''); // Clear if contact_id exists but contact not found in list
        }
      } else {
        setContactName(''); // Clear if no contact_id or no contacts loaded
      }
    } else {
      setContactName(''); // Reset for new property
      // Reset form data for new entry
      setFormData({
        contact_id: '',
        handler: '',
        source: 'מאגר',
        category: 'פרטי',
        property_type: 'דירה',
        price: '',
        city: '',
        area: '',
        street: '',
        building_number: '',
        apartment_number: '',
        rooms: '',
        floor: '',
        total_floors: '',
        parking: false,
        air_conditioning: false,
        storage: false,
        image_urls: []
      });
    }
  }, [property, contacts]); // Added contacts to dependency array

  const handleSubmit = async (e) => { // Made async
    e.preventDefault();
    if (!contactName.trim()) {
      alert("שדה 'איש קשר' הוא חובה.");
      return;
    }
    setIsSubmitting(true);

    let finalContactId;
    const existingContact = contacts.find(c => c.full_name.toLowerCase() === contactName.trim().toLowerCase());

    if (existingContact) {
      finalContactId = existingContact.id;
    } else {
      try {
        const newContact = await Contact.create({ full_name: contactName.trim() });
        finalContactId = newContact.id;
      } catch (error) {
        console.error("Error creating new contact:", error);
        alert("שגיאה ביצירת איש קשר חדש. אנא נסה שוב.");
        setIsSubmitting(false);
        return;
      }
    }

    const dataToSubmit = {
      ...formData,
      contact_id: finalContactId,
      price: formData.price ? parseInt(formData.price) : null
    };

    try {
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error submitting property form:", error);
      alert("שגיאה בשמירת הנכס. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, index) => index !== indexToDelete)
    }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-600" />
            {property ? 'עריכת נכס מהמאגר' : 'נכס חדש למאגר'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_name">איש קשר *</Label> {/* Changed htmlFor */}
                <Input
                  id="contact_name" // Changed id
                  list="contacts-inventory-list" // Added datalist attribute
                  placeholder="הקלד שם חדש או בחר מהרשימה"
                  value={contactName} // Bind to new state
                  onChange={(e) => setContactName(e.target.value)} // Update contactName state
                  required
                />
                <datalist id="contacts-inventory-list">
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.full_name} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handler">בטיפול של</Label>
                <Input
                  id="handler"
                  value={formData.handler}
                  onChange={(e) => handleInputChange('handler', e.target.value)}
                  placeholder="שם המטפל"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">סוג נכס</Label>
                <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
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
                <Label htmlFor="price">מחיר</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="מחיר מבוקש"
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
                <Label htmlFor="area">אזור</Label>
                <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
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
                <Label htmlFor="street">רחוב</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="שם הרחוב"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building_number">מספר בית</Label>
                <Input
                  id="building_number"
                  value={formData.building_number}
                  onChange={(e) => handleInputChange('building_number', e.target.value)}
                  placeholder="מספר הבית"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment_number">מספר דירה</Label>
                <Input
                  id="apartment_number"
                  value={formData.apartment_number}
                  onChange={(e) => handleInputChange('apartment_number', e.target.value)}
                  placeholder="מספר הדירה"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">חדרים</Label>
                <Select value={formData.rooms} onValueChange={(value) => handleInputChange('rooms', value)}>
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
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-base font-medium">מאפיינים נוספים</Label>
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
              {formData.image_urls && formData.image_urls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {formData.image_urls.map((url, index) => (
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

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                <XIcon className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                <Save className={`w-4 h-4 ml-2 ${isSubmitting ? 'hidden' : ''}`} />
                {property ? 'עדכן נכס' : 'צור נכס'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
