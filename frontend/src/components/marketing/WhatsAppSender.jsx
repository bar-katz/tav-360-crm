
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { X, MessageCircle, Send, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MarketingLog, MarketingLead } from "@/api/entities";
import config from "@/config";

const DEFAULT_MESSAGE = `היי {first_name}, יש לנו נכסים שמתאימים בדיוק לתקציב שלך באזור {neighborhood}. רוצה לשמוע פרטים?`;

export default function WhatsAppSender({ selectedLeads, onClose, onSuccess }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  const personalizeMessage = (template, lead) => {
    return template
      .replace(/{first_name}/g, lead.first_name || 'שם')
      .replace(/{last_name}/g, lead.last_name || '')
      .replace(/{neighborhood}/g, lead.neighborhood || 'האזור')
      .replace(/{budget}/g, lead.budget || 'התקציב')
      .replace(/{client_type}/g, lead.client_type === 'קונה' ? 'לקנייה' : 'להשכרה');
  };

  const formatPhoneForWhatsApp = (phone) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.substring(1);
    }
    return cleanPhone;
  };

  const sendWhatsAppMessage = async (lead, personalizedMessage) => {
    // Call the backend WhatsApp API
    // Use config module for consistent API URL
    const baseUrl = config.api.baseUrl;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${baseUrl}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number: lead.phone_number,
          message: personalizedMessage,
          lead_id: lead.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }

    try {
      await MarketingLog.create({
        lead_id: lead.id,
        phone_number: lead.phone_number,
        message_content: personalizedMessage,
        status: isSuccess ? 'נשלח' : 'נכשל',
        sent_date: new Date().toISOString(),
        response_data: JSON.stringify(responseData)
      });
      return { success: isSuccess, error: isSuccess ? null : "Simulation failed" };
    } catch (logError) {
      console.error("Error creating marketing log:", logError);
      return { success: false, error: "Failed to create log" };
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    const results = { sent: 0, failed: 0, errors: [] };
    const today = new Date().toISOString().split('T')[0];

    for (const lead of selectedLeads) {
      const personalizedMessage = personalizeMessage(message, lead);
      
      const randomDelay = Math.floor(Math.random() * 8000 + 2000); // 2-10 seconds
      
      const result = await sendWhatsAppMessage(lead, personalizedMessage);
      
      if (result.success) {
        results.sent++;
        try {
          // Update the lead's last_contacted date
          await MarketingLead.update(lead.id, { last_contacted: today });
        } catch (updateError) {
          console.error(`Failed to update last_contacted date for lead ${lead.id}:`, updateError);
          // This is not a sending failure, but should be noted.
        }
      } else {
        results.failed++;
        results.errors.push(`${lead.first_name} ${lead.last_name}: ${result.error}`);
      }

      if (lead !== selectedLeads[selectedLeads.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, randomDelay));
      }
    }

    setSendResults(results);
    setIsSending(false);

    if (results.sent > 0) {
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }
  };

  const previewMessage = selectedLeads[0] ? personalizeMessage(message, selectedLeads[0]) : message;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                שליחת הודעות WhatsApp
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                מוכן לשלוח ל-{selectedLeads.length} לידים. ודא שההודעה נכונה לפני השליחה.
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">תוכן ההודעה</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-32"
                placeholder="הקלד את ההודעה שלך כאן..."
              />
              <div className="text-xs text-slate-500 mt-2">
                אפשר להשתמש במשתנים: {'{first_name}'}, {'{last_name}'}, {'{neighborhood}'}, {'{budget}'}, {'{client_type}'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">תצוגה מקדימה</label>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">WhatsApp</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{previewMessage}</p>
              </div>
            </div>

            {sendResults && (
              <Alert className={sendResults.sent > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>נשלחו {sendResults.sent} הודעות, נכשלו {sendResults.failed}</div>
                    {sendResults.errors.length > 0 && (
                      <div>
                        <div className="font-medium mb-1">שגיאות:</div>
                        <ul className="text-xs space-y-1">
                          {sendResults.errors.slice(0, 3).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {sendResults.errors.length > 3 && (
                            <li>ועוד {sendResults.errors.length - 3} שגיאות...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                ביטול
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={isSending || !message.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <>שולח... ({selectedLeads.length})</>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    שלח הודעות ({selectedLeads.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
