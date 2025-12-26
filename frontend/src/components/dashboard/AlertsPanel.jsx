
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Phone, Users, Target, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { apiClient } from "@/api/apiClient";

export default function AlertsPanel() {
  const [untreatedLeads, setUntreatedLeads] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [urgentServiceCalls, setUrgentServiceCalls] = useState([]);
  const [urgentMeetings, setUrgentMeetings] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      // Load alerts from backend endpoint
      const alertsData = await apiClient.get('/dashboard/alerts');
      
      setUntreatedLeads(alertsData.untreated_leads || []);
      setRecentMatches(alertsData.recent_matches || []);
      setUrgentServiceCalls(alertsData.urgent_service_calls || []);
      setUrgentMeetings(alertsData.urgent_meetings || []);
      
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
    setIsLoadingAlerts(false);
  };

  const handleSendAlerts = async () => {
    setIsSendingAlerts(true);
    try {
      // Reload alerts (backend handles the logic)
      await loadAlerts();
      
      if (untreatedLeads.length > 0) {
        const leadNames = untreatedLeads.map(lead => 
          lead.contact?.full_name || `ליד ${lead.id}`
        ).join(', ');
        alert(`נמצאו ${untreatedLeads.length} לידים שלא טופלו למעלה מ-4 שעות: ${leadNames}. אנא טפל בהם.`);
      } else {
        alert("לא נמצאו לידים הדורשים טיפול מיידי.");
      }
    } catch (error) {
      console.error("Error checking for unanswered leads:", error);
      alert("שגיאה בבדיקת לידים שלא טופלו.");
    }
    setIsSendingAlerts(false);
  };

  const totalAlerts = urgentServiceCalls.length + urgentMeetings.length + untreatedLeads.length;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            התראות
            {totalAlerts > 0 && (
              <Badge className="bg-red-100 text-red-800 ml-2">
                {totalAlerts}
              </Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendAlerts}
            disabled={isSendingAlerts}
            className="text-xs"
          >
            {isSendingAlerts ? (
              <RefreshCw className="w-3 h-3 animate-spin ml-1" />
            ) : (
              <RefreshCw className="w-3 h-3 ml-1" />
            )}
            בדוק לידים ללא מענה
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingAlerts ? (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-500 mt-2">טוען התראות...</p>
          </div>
        ) : totalAlerts === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-slate-600">אין התראות דחופות</p>
            <p className="text-sm text-slate-400">הכל נראה תקין</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* לידים שלא טופלו */}
            {untreatedLeads.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  לידים שלא טופלו ({untreatedLeads.length})
                </h4>
                <div className="space-y-2">
                  {untreatedLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-red-900 text-sm">
                          {lead.contact?.full_name || 'ללא שם'}
                        </p>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {lead.hours_ago || 0} שעות
                        </Badge>
                      </div>
                      <p className="text-red-700 text-sm">
                        {lead.desired_property_type || lead.preferred_property_type} - {lead.request_category || lead.request_type}
                        {lead.budget && ` (${lead.budget.toLocaleString()} ₪)`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* התאמות חדשות */}
            {recentMatches.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  התאמות חדשות מהיום האחרון ({recentMatches.length})
                </h4>
                <div className="space-y-2">
                  {recentMatches.slice(0, 2).map((match) => (
                    <div key={match.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-blue-900 text-sm">
                          התאמה חדשה
                        </p>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          ציון: {match.match_score}%
                        </Badge>
                      </div>
                      <p className="text-blue-700 text-xs">
                        נוצרה: {format(new Date(match.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* קריאות שירות דחופות - קיים */}
            {urgentServiceCalls.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  קריאות שירות דחופות ({urgentServiceCalls.length})
                </h4>
                <div className="space-y-2">
                  {urgentServiceCalls.slice(0, 3).map((call) => (
                    <div key={call.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-red-900 text-sm">
                          קריאה #{call.call_number || call.id?.slice(-4) || 'לא ידוע'}
                        </p>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {call.urgency || 'לא מוגדר'}
                        </Badge>
                      </div>
                      <p className="text-red-700 text-sm truncate">
                        {call.description || 'אין תיאור'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* פגישות דחופות - קיים */}
            {urgentMeetings.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  פגישות דחופות ({urgentMeetings.length})
                </h4>
                <div className="space-y-2">
                  {urgentMeetings.slice(0, 3).map((meeting) => (
                    <div key={meeting.id} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-orange-900 text-sm truncate">
                          {meeting.meeting_type || 'פגישה'}
                        </p>
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          דחוף
                        </Badge>
                      </div>
                      {meeting.start_date && (
                        <p className="text-orange-700 text-xs">
                          תאריך: {format(new Date(meeting.start_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
