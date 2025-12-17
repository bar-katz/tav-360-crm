import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Trash2, Edit, User, Phone, Home, Building2, Wallet, Star, AlertTriangle } from "lucide-react";

const statusColors = {
  "הותאם": "bg-blue-100 text-blue-800",
  "נשלח": "bg-green-100 text-green-800",
  "לא רלוונטי": "bg-red-100 text-red-800",
};

export default function MatchesList({ matches, properties, buyers, contacts, isLoading, onEdit, onDelete }) {
  console.log("MatchesList - קיבל נתונים:", { matches, properties, buyers, contacts });

  const getContactById = (contactId) => contacts.find(c => c.id === contactId);
  const getPropertyById = (propertyId) => properties.find(p => p.id === propertyId);
  const getBuyerById = (buyerId) => buyers.find(b => b.id === buyerId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-40 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Target className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">לא נמצאו התאמות</h3>
        <p className="text-slate-400">צור קונים ונכסים חדשים כדי ליצור התאמות אוטומטיות.</p>
      </Card>
    );
  }

  // פילטור התאמות תקינות בלבד
  const validMatches = matches.filter(match => {
    const property = getPropertyById(match.property_id);
    const buyer = getBuyerById(match.buyer_id);
    
    if (!property || !buyer) {
      console.warn(`התאמה פגומה נמצאה - מתעלם: ${match.id}, property: ${match.property_id}, buyer: ${match.buyer_id}`);
      return false;
    }
    return true;
  });

  if (validMatches.length === 0) {
    return (
      <Card className="p-12 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto text-orange-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">נמצאו התאמות פגומות</h3>
        <p className="text-slate-400">יש התאמות במערכת שמקושרות לנכסים או קונים שלא קיימים.</p>
        <p className="text-slate-400 mt-2">נסה ליצור התאמות חדשות באמצעות כפתור "יצירת התאמות אוטומטיות".</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-700">מציג {validMatches.length} התאמות תקינות</h3>
      {matches.length > validMatches.length && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              נמצאו {matches.length - validMatches.length} התאמות פגומות שלא מוצגות
            </span>
          </div>
        </div>
      )}
      <AnimatePresence>
        {validMatches.map((match, index) => {
          const property = getPropertyById(match.property_id);
          const buyer = getBuyerById(match.buyer_id);
          const buyerContact = buyer ? getContactById(buyer.contact_id) : null;
          const propertyContact = property ? getContactById(property.contact_id) : null;

          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardHeader className="pb-4 bg-slate-50 border-b">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-md">
                        <Star className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">ציון התאמה: {match.match_score}%</CardTitle>
                        <p className="text-sm text-slate-500">
                          נוצרה בתאריך: {new Date(match.created_date).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[match.status]}>{match.status}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(match)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(match.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Buyer Demand Section */}
                  <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-lg text-blue-800 flex items-center gap-2">
                      <User className="w-5 h-5" />ביקוש (קונה)
                    </h4>
                    <div className="text-base font-semibold">{buyerContact?.full_name || 'לא נמצא איש קשר'}</div>
                    {buyerContact?.phone && (
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {buyerContact.phone}
                      </div>
                    )}
                    <hr/>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" /> 
                      <strong>סוג נכס:</strong> {buyer.desired_property_type}
                    </div>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Home className="w-4 h-4 text-slate-500" /> 
                      <strong>אזור:</strong> {buyer.desired_area}
                    </div>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-slate-500" /> 
                      <strong>תקציב:</strong> {buyer.budget ? `${buyer.budget.toLocaleString()} ₪` : 'לא צוין'}
                    </div>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Home className="w-4 h-4 text-slate-500" /> 
                      <strong>חדרים מבוקשים:</strong> {buyer.desired_rooms}
                    </div>
                  </div>
                  
                  {/* Property Supply Section */}
                  <div className="space-y-3 p-4 bg-green-50/50 rounded-xl border border-green-200">
                    <h4 className="font-bold text-lg text-green-800 flex items-center gap-2">
                      <Home className="w-5 h-5" />היצע (נכס)
                    </h4>
                    <div className="text-base font-semibold">
                      {property.street} {property.building_number}, {property.city}
                    </div>
                    {propertyContact && (
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <User className="w-4 h-4" /> {propertyContact.full_name}
                      </div>
                    )}
                    <hr/>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" /> 
                      <strong>סוג נכס:</strong> {property.property_type}
                    </div>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Home className="w-4 h-4 text-slate-500" /> 
                      <strong>אזור:</strong> {property.area}
                    </div>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-slate-500" /> 
                      <strong>מחיר:</strong> {property.price ? `${property.price.toLocaleString()} ₪` : 'לא צוין'}
                    </div>
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Home className="w-4 h-4 text-slate-500" /> 
                      <strong>חדרים:</strong> {property.rooms}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}