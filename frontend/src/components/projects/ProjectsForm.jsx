import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, X, Building2 } from "lucide-react";

const statuses = ["פתוח לדיירים", "נסגר"];

export default function ProjectsForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    developer: '',
    total_units: '',
    price_range_min: '',
    price_range_max: '',
    status: 'פתוח לדיירים'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        location: project.location || '',
        developer: project.developer || '',
        total_units: project.total_units || '',
        price_range_min: project.price_range_min || '',
        price_range_max: project.price_range_max || '',
        status: project.status || 'פתוח לדיירים'
      });
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map form fields to database fields - only send fields that exist in the database
    const dataToSubmit = {
      name: formData.name,
      description: formData.description || null,
      location: formData.location || null,
      developer: formData.developer || null,
      total_units: formData.total_units ? parseInt(formData.total_units, 10) : null,
      price_range_min: formData.price_range_min ? parseFloat(formData.price_range_min) : null,
      price_range_max: formData.price_range_max ? parseFloat(formData.price_range_max) : null,
      status: formData.status || null
    };
    onSubmit(dataToSubmit);
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
            <Building2 className="w-5 h-5 text-blue-600" />
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">שם פרויקט *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="שם הפרויקט"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס פרויקט</Label>
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
                <Label htmlFor="location">מיקום *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="מיקום הפרויקט (עיר/אזור)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developer">יזם</Label>
                <Input
                  id="developer"
                  value={formData.developer}
                  onChange={(e) => handleInputChange('developer', e.target.value)}
                  placeholder="שם היזם"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_units">סה״כ יחידות</Label>
                <Input
                  id="total_units"
                  type="number"
                  value={formData.total_units}
                  onChange={(e) => handleInputChange('total_units', e.target.value)}
                  placeholder="מספר יחידות דיור"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range_min">טווח מחירים - מינימום</Label>
                <Input
                  id="price_range_min"
                  type="number"
                  value={formData.price_range_min}
                  onChange={(e) => handleInputChange('price_range_min', e.target.value)}
                  placeholder="מחיר מינימלי בשקלים"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range_max">טווח מחירים - מקסימום</Label>
                <Input
                  id="price_range_max"
                  type="number"
                  value={formData.price_range_max}
                  onChange={(e) => handleInputChange('price_range_max', e.target.value)}
                  placeholder="מחיר מקסימלי בשקלים"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="description">תיאור הפרויקט</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור מפורט של הפרויקט"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 ml-2" />
                {project ? 'עדכן פרויקט' : 'צור פרויקט'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}