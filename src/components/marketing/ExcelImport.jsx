
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle, Eye, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { MarketingLead } from "@/api/entities";

const COLUMN_MAPPING = {
  'מספר טלפון': 'phone_number',
  'שם פרטי': 'first_name', 
  'שם משפחה': 'last_name',
  'תקציב': 'budget',
  'שכונה': 'neighborhood',
  'רחוב': 'street',
  'חדרים - מ': 'rooms_min',
  'חדרים - עד': 'rooms_max',
  'סוג לקוח': 'client_type',
  'רצינות': 'seriousness',
  'הערות נוספות': 'additional_notes',
  'ביקש לא לקבל דיוור': 'opt_out_whatsapp'
};

export default function ExcelImport({ onSuccess, onCancel }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [skippedRows, setSkippedRows] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
      setImportResults(null);
      setPreviewData(null);
      setShowPreview(false);
      setSkippedRows([]);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    let phoneStr = phone.toString().replace(/\D/g, '');
    
    if (phoneStr.startsWith('0')) {
      phoneStr = '972' + phoneStr.substring(1);
    } else if (!phoneStr.startsWith('972')) {
      phoneStr = '972' + phoneStr;
    }
    
    return phoneStr;
  };

  const cleanBudget = (budget) => {
    if (!budget) return '';
    return budget.toString().replace(/[₪,]/g, '').trim();
  };

  // פונקציה משופרת לפרסור CSV עם תמיכה בעברית ומפרידים שונים
  const parseCSV = (text) => {
    // הסרת BOM אם קיים (קריטי לקבצי UTF-8)
    const cleanText = text.replace(/^\uFEFF/, '').replace(/^\ufeff/, '');
    
    // פיצול לשורות
    const lines = cleanText.split(/\r?\n/);
    
    if (lines.length < 2) {
      throw new Error('הקובץ חייב לכלול לפחות שורת כותרות ושורת נתונים אחת');
    }
    
    // זיהוי מפריד (נקודה-פסיק או פסיק)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    console.log('Using delimiter:', delimiter);
    
    // פרסור שורת הכותרות
    const headers = parseCSVLine(lines[0], delimiter);
    
    // ניקוי שמות עמודות (הסרת רווחים מיותרים וכו')
    const cleanedHeaders = headers.map(h => h.trim().replace(/^["']|["']$/g, ''));
    console.log('Headers found:', cleanedHeaders);
    
    const data = [];
    
    // פרסור שורות הנתונים
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = parseCSVLine(line, delimiter);
        if (values.length > 0) {
          const row = {};
          cleanedHeaders.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim().replace(/^["']|["']$/g, '') : '';
          });
          data.push(row);
        }
      }
    }
    
    console.log('Parsed data count:', data.length);
    console.log('First row sample:', data[0]);
    return data;
  };

  // פונקציה משופרת לפרסור שורה בודדת
  const parseCSVLine = (line, delimiter = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // מרכאות כפולות - הכנס מרכאה אחת
          current += '"';
          i++; // דלג על המרכאה השנייה
        } else {
          // התחלה או סיום של מרכאות
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // מפריד מחוץ למרכאות - סיום שדה
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // הוספת השדה האחרון
    result.push(current.trim());
    
    return result;
  };

  const handlePreview = async () => {
    if (!file) return;
    
    try {
      const text = await file.text();
      const rawData = parseCSV(text);
      
      // הצגת 5 שורות ראשונות לתצוגה מקדימה
      setPreviewData({
        headers: Object.keys(rawData[0] || {}),
        rows: rawData.slice(0, 5),
        totalRows: rawData.length
      });
      setShowPreview(true);
    } catch (error) {
      setUploadStatus(`שגיאה בקריאת הקובץ: ${error.message}`);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('קורא קובץ...');
    setSkippedRows([]);

    try {
      setUploadStatus('טוען לידים קיימים לבדיקת כפילויות...');
      const existingLeads = await MarketingLead.list();
      const existingLeadKeys = new Set(
        existingLeads.map(lead => `${lead.first_name?.toLowerCase().trim()}-${lead.phone_number}-${lead.street?.toLowerCase().trim()}`)
      );

      setUploadStatus('קורא קובץ CSV...');
      const text = await file.text();
      const rawData = parseCSV(text);
      
      console.log('Raw data sample:', rawData[0]);
      
      setUploadStatus('מעבד נתונים...');
      
      // המרת הנתונים לפורמט המערכת
      const processedData = rawData.map((row) => {
        const processedRow = {
          import_date: new Date().toISOString().split('T')[0]
        };

        Object.entries(COLUMN_MAPPING).forEach(([excelColumn, systemField]) => {
          let value = row[excelColumn] || '';
          
          // עיבוד מיוחד לשדות מסוימים
          if (systemField === 'phone_number') {
            value = formatPhoneNumber(value);
          } else if (systemField === 'budget') {
            value = cleanBudget(value);
          } else if (systemField === 'rooms_min' || systemField === 'rooms_max') {
            value = value ? parseInt(value) || 0 : 0;
          }
          
          if (value !== '' && value !== null && value !== undefined) {
            processedRow[systemField] = value;
          }
        });

        return processedRow;
      });

      console.log('Processed data sample:', processedData[0]);

      // סינון רשומות עם נתונים חיוניים והפרדת שורות שדולגו
      const validData = [];
      const skipped = [];
      // Use a temporary set to check for duplicates within the current CSV file itself
      const currentImportLeadKeys = new Set(); 

      processedData.forEach((row, index) => {
        const missingFields = [];
        if (!row.phone_number) missingFields.push('מספר טלפון');
        if (!row.first_name) missingFields.push('שם פרטי');
        if (!row.client_type) missingFields.push('סוג לקוח');

        if (missingFields.length > 0) {
          skipped.push({ 
            data: row, 
            reason: `שדות חובה חסרים: ${missingFields.join(', ')}`,
            originalLineNumber: index + 2 // +2 for 0-based index and header row
          });
          return; // דלג לשורה הבאה
        }
        
        // בדיקת כפילויות
        const leadKey = `${row.first_name?.toLowerCase().trim()}-${row.phone_number}-${row.street?.toLowerCase().trim()}`;
        if (existingLeadKeys.has(leadKey) || currentImportLeadKeys.has(leadKey)) { // Check against existing DB leads AND leads already processed from current file
          skipped.push({
            data: row,
            reason: 'כפילות (שם, טלפון ורחוב זהים)',
            originalLineNumber: index + 2
          });
        } else {
          validData.push(row);
          currentImportLeadKeys.add(leadKey); // הוסף למאגר כדי למנוע כפילויות מאותו קובץ
        }
      });
      
      console.log('Valid data count:', validData.length);
      console.log('Skipped data count:', skipped.length);

      setSkippedRows(skipped.slice(0, 5)); // Store up to 5 examples of skipped rows for display

      setUploadStatus('יוצר רשומות...');
      
      // שמירה בבסיס הנתונים עם השהיות גדולות יותר ולוגיקת ריטרי
      const results = [];
      const errors = []; // Array to store errors during creation
      let consecutiveRateLimitErrors = 0; // Counter for consecutive rate limit errors

      if (validData.length > 0) {
        for (let i = 0; i < validData.length; i++) {
          const leadData = validData[i];
          let success = false;
          let retryCount = 0;
          const maxRetries = 3; // Max attempts to create a single lead
          
          while (!success && retryCount < maxRetries) {
            try {
              // עדכון סטטוס התקדמות
              setUploadStatus(`יוצר רשומות... (${i + 1}/${validData.length})`);
              
              const result = await MarketingLead.create(leadData);
              results.push(result);
              success = true; // Lead created successfully
              consecutiveRateLimitErrors = 0; // Reset consecutive rate limit error counter on success
              
            } catch (error) {
              console.error('Error creating lead:', leadData, error);
              
              // Check if the error is a rate limit error (e.g., status 429)
              if (error.message && (error.message.includes('Rate limit') || error.message.includes('429'))) {
                consecutiveRateLimitErrors++;
                // Exponential backoff for waiting time, capping at 30 seconds
                const waitTime = Math.min(5000 * consecutiveRateLimitErrors, 30000); 
                console.log(`Rate limit detected (attempt ${retryCount + 1}), waiting ${waitTime}ms...`);
                setUploadStatus(`מחכה ${Math.ceil(waitTime/1000)} שניות בגלל הגבלת קצב... (${i + 1}/${validData.length})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                retryCount++;
              } else {
                // Other error types: add to errors and move to next lead
                errors.push({
                  data: leadData,
                  error: error.message || 'שגיאה לא ידועה'
                });
                success = true; // Mark as processed (even if failed) to move to the next lead
              }
            }
          }
          
          // If lead creation failed after all retries
          if (!success) {
            errors.push({
              data: leadData,
              error: 'נכשל אחרי מספר ניסיונות'
            });
          }
          
          // Add a delay between records, adjusted by recent rate limit issues
          if (i < validData.length - 1) {
            const baseDelay = 500; // Base delay of 500ms
            const additionalDelay = consecutiveRateLimitErrors * 1000; // Add 1 second for each recent rate limit error
            const totalDelay = baseDelay + additionalDelay;
            await new Promise(resolve => setTimeout(resolve, totalDelay));
          }
        }
      }

      setImportResults({
        total: rawData.length,
        processed: processedData.length,
        valid: validData.length,
        imported: results.length,
        skipped: skipped.length, // Total count of skipped rows due to missing data or duplicates
        errors: errors.length // Total count of errors during DB creation
      });

      if (results.length > 0) {
        setUploadStatus(`הושלם בהצלחה! יובאו ${results.length} רשומות.${errors.length > 0 ? ` ${errors.length} רשומות נכשלו.` : ''}`);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setUploadStatus('הושלם, אך לא יובאו רשומות. בדוק את השגיאות.');
      }

    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus(`שגיאה קריטית: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            ייבוא מקובץ CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              <strong>הוראות ייבוא:</strong>
              <br />
              1. שמור את קובץ האקסל שלך בפורמט CSV (Comma Separated Values)
              <br />
              2. וודא שהעמודה הראשונה מכילה את שמות השדות: מספר טלפון, שם פרטי, שם משפחה, תקציב, שכונה, רחוב, חדרים - מ, חדרים - עד, סוג לקוח, רצינות, הערות נוספות, ביקש לא לקבל דיוור
              <br />
              3. שדות חובה: מספר טלפון, שם פרטי, סוג לקוח
              <br />
              4. לידים עם <strong>אותו שם פרטי, מספר טלפון ורחוב</strong> ייחשבו ככפילויות ולא ייובאו.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">בחר קובץ CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>

            {file && (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    נבחר: {file.name} ({Math.round(file.size / 1024)} KB)
                  </AlertDescription>
                </Alert>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  className="w-full"
                  disabled={isUploading}
                >
                  <Eye className="w-4 h-4 ml-2" />
                  תצוגה מקדימה
                </Button>
              </div>
            )}

            {showPreview && previewData && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>נתוני הקובץ:</strong></div>
                    <div>סה"כ שורות: {previewData.totalRows}</div>
                    <div>עמודות שנמצאו: {previewData.headers.join(', ')}</div>
                    <div className="text-xs mt-2">
                      <strong>דוגמה לנתונים:</strong>
                      <pre className="bg-white p-2 rounded mt-1 text-xs">
                        {JSON.stringify(previewData.rows[0], null, 2)}
                      </pre>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus && (
              <Alert className={uploadStatus.includes('שגיאה') || uploadStatus.includes('נכשלו') ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadStatus}</AlertDescription>
              </Alert>
            )}

            {importResults && (
              <Alert className={importResults.imported > 0 && importResults.skipped === 0 && importResults.errors === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div>סה"כ שורות בקובץ: {importResults.total}</div>
                    <div>שורות עם נתונים תקינים: {importResults.valid}</div>
                    <div><strong>רשומות שיובאו בהצלחה: {importResults.imported}</strong></div>
                    <div>רשומות שדולגו עקב חוסר נתונים או כפילות: {importResults.skipped}</div>
                    <div>רשומות שלא יובאו עקב שגיאה: {importResults.errors}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {skippedRows.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-bold mb-2">נמצאו שורות עם נתונים חסרים או כפילויות:</div>
                  <ul className="space-y-2 text-xs">
                    {skippedRows.map((item, index) => (
                      <li key={index}>
                        <strong>סיבה:</strong> {item.reason}
                        {item.originalLineNumber && <span> (שורה {item.originalLineNumber})</span>}
                        <pre className="mt-1 bg-red-50 p-1 rounded overflow-x-auto">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </li>
                    ))}
                  </ul>
                  {importResults && importResults.skipped > 5 && (
                    <div className="mt-2 text-xs font-medium">...ועוד {importResults.skipped - 5} רשומות שדולגו.</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
              <X className="w-4 h-4 ml-2" />
              ביטול
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUploading ? 'מייבא...' : 'התחל ייבוא'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
