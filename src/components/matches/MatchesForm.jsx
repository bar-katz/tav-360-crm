import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Save, X, Target } from "lucide-react";

export default function MatchesForm({ match, properties, buyers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    property_id: '',
    buyer_id: '',
    match_score: 85,
    status: 'הותאם'
  });

  useEffect(() => {
    if (match) {
      setFormData({
        property_id: match.property_id || '',
        buyer_id: match.buyer_id || '',
        match_score: match.match_score || 85,
        status: match.status || 'הותאם'
      });
    }
  }, [match]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // וידוא שכל השדות הנדרשים מלאים
    if (!formData.property_id || !formData.buyer_id) {
      alert('יש למלא את כל השדות הנדרשים');
      return;
    }
    
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {match ? 'עריכת התאמה' : 'התאמה חדשה'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="property_id">נכס *</Label>
                <Select 
                  value={formData.property_id} 
                  onValueChange={(value) => handleInputChange('property_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר נכס" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.property_type} ב{property.city} - {property.street} {property.building_number}
                        {property.price && ` (${property.price.toLocaleString()} ₪)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyer_id">קונה *</Label>
                <Select 
                  value={formData.buyer_id} 
                  onValueChange={(value) => handleInputChange('buyer_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קונה" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.desired_property_type} - {buyer.desired_area}
                        {buyer.budget && ` (תקציב: ${buyer.budget.toLocaleString()} ₪)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="match_score">ציון התאמה (0-100) *</Label>
                <Input
                  id="match_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.match_score}
                  onChange={(e) => handleInputChange('match_score', parseInt(e.target.value) || 0)}
                  required
                  className="text-center"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="הותאם">הותאם</SelectItem>
                    <SelectItem value="נשלח">נשלח</SelectItem>
                    <SelectItem value="לא רלוונטי">לא רלוונטי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="px-6"
              >
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                <Save className="w-4 h-4 ml-2" />
                {match ? 'עדכן התאמה' : 'צור התאמה'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}