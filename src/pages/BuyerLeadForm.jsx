import React, { useState } from "react";
import { Contact, BuyersRenters } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Send, UserPlus } from "lucide-react";

export default function BuyerLeadForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    request_type: 'קנייה',
    city: '',
    preferred_property_type: 'דירה',
    budget: '',
    preferred_rooms: '',
    source: 'טופס'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // יצירת איש קשר חדש
      const contactData = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email
      };
      
      const newContact = await Contact.create(contactData);

      // יצירת רשומה באובייקט קונים/שוכרים
      const buyerData = {
        contact_id: newContact.id,
        request_type: formData.request_type,
        preferred_property_type: formData.preferred_property_type,
        budget: formData.budget ? parseInt(formData.budget) : null,
        preferred_rooms: formData.preferred_rooms,
        source: formData.source,
        status: 'ליד חדש'
      };

      await BuyersRenters.create(buyerData);
      
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("אירעה שגיאה בשליחת הטופס. אנא נסה שוב.");
    }
    
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6" style={{ direction: 'rtl' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">תודה רבה!</h2>
              <p className="text-slate-600 mb-4">פרטייך התקבלו בהצלחה</p>
              <p className="text-sm text-slate-500">נציג מחברת תל אביב 360 יחזור אליך בהקדם</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6" style={{ direction: 'rtl' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <UserPlus className="w-6 h-6" />
              קליטת ליד קונה
            </CardTitle>
            <p className="text-blue-100 mt-2">מלא את הפרטים ונציג יחזור אליך בהקדם</p>
          </CardHeader>
          <CardContent className="p-8">
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
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="050-1234567"
                    required
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
                  <Label htmlFor="request_type">סוג עסקה *</Label>
                  <Select value={formData.request_type} onValueChange={(value) => handleInputChange('request_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="קנייה">קנייה</SelectItem>
                      <SelectItem value="שכירות">שכירות</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_property_type">סוג נכס רצוי</Label>
                  <Select value={formData.preferred_property_type} onValueChange={(value) => handleInputChange('preferred_property_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="דירה">דירה</SelectItem>
                      <SelectItem value="בית">בית</SelectItem>
                      <SelectItem value="משרד">משרד</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">תקציב</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="תקציב בשקלים"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_rooms">מספר חדרים</Label>
                  <Select value={formData.preferred_rooms} onValueChange={(value) => handleInputChange('preferred_rooms', value)}>
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

                <div className="space-y-2">
                  <Label htmlFor="source">מקור הגעה</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="טופס">טופס</SelectItem>
                      <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                      <SelectItem value="פה לאוזן">פה לאוזן</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      שלח פרטים
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}