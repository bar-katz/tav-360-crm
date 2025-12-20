# Feature Request: Data Extraction from Files

**Status:** 🔴 Not Implemented  
**Priority:** Medium  
**Category:** Integration

## Description

Implement data extraction from uploaded files to automatically parse and extract structured data from documents. This would enable:
- Extracting property details from PDF listings
- Parsing client information from documents
- Extracting data from contracts
- OCR from scanned documents
- Parsing Excel/CSV files

## Current Status

- ✅ Backend endpoint exists: `POST /api/integrations/extract`
- ✅ Frontend function exists: `ExtractDataFromUploadedFile()` in `src/api/integrations.ts`
- ⚠️ Returns placeholder response: `{success: false, message: "Data extraction service not configured"}`

## Implementation Requirements

### Backend Implementation

**Location:** `backend/src/routes/integrations.py` - `extract_data_from_file()` function

**Options for Data Extraction:**

1. **PDF Parsing**
   - Use `PyPDF2` or `pdfplumber` for PDF text extraction
   - Use `pymupdf` (fitz) for advanced PDF parsing
   - Extract structured data from PDF forms

2. **OCR (Optical Character Recognition)**
   - Use `Tesseract OCR` for scanned documents
   - Use cloud OCR services (Google Vision, AWS Textract)
   - Extract text from images

3. **Excel/CSV Parsing**
   - Use `pandas` for Excel/CSV parsing
   - Extract structured data from spreadsheets
   - Parse property listings from Excel files

4. **Document AI Services**
   - Google Document AI
   - AWS Textract
   - Azure Form Recognizer
   - Extract structured data from forms/documents

**Environment Variables Needed:**
```bash
EXTRACTION_PROVIDER=local|google|aws|azure
# For Google Document AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
# For AWS Textract
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
# For Azure
AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com
AZURE_FORM_RECOGNIZER_KEY=your-key
```

**Request Format:**
```json
{
  "file_url": "https://backend.example.com/uploads/document.pdf",
  "extraction_type": "property_listing|client_info|contract|ocr|excel"
}
```

**Response Format:**
```json
{
  "success": true,
  "extracted_data": {
    "property_type": "Apartment",
    "rooms": 3,
    "price": 1500000,
    "city": "Tel Aviv",
    "address": "123 Main St"
  },
  "confidence": 0.95,
  "raw_text": "Full extracted text...",
  "extraction_type": "property_listing"
}
```

### Frontend Usage

Already implemented in `src/api/integrations.ts`:
```typescript
const result = await ExtractDataFromUploadedFile({
  file_url: "https://backend.example.com/uploads/property.pdf",
  extraction_type: "property_listing"
});
```

## Use Cases

1. **Property Listings**
   - Extract property details from PDF listings
   - Parse Excel files with multiple properties
   - Extract images from PDFs

2. **Client Information**
   - Extract client data from forms
   - Parse ID documents
   - Extract contact information

3. **Contracts**
   - Extract key terms from contracts
   - Parse lease agreements
   - Extract dates and amounts

4. **Scanned Documents**
   - OCR scanned property documents
   - Extract text from images
   - Parse handwritten forms (advanced)

## Dependencies

- PDF parsing library (`PyPDF2`, `pdfplumber`, `pymupdf`)
- OCR library (`pytesseract`) or cloud OCR service
- Excel parsing (`pandas`, `openpyxl`)
- Optional: Cloud document AI service SDK

## Testing

- Test with various file formats (PDF, Excel, images)
- Test with different document structures
- Test error handling (corrupted files, unsupported formats)
- Test extraction accuracy
- Test with Hebrew text (RTL support)

## Security Considerations

- Validate file types and sizes
- Sanitize extracted data
- Handle sensitive information securely
- Implement rate limiting
- Log extraction requests for audit
- Consider data privacy regulations

## Future Enhancements

- Custom extraction templates
- Machine learning for better accuracy
- Batch file processing
- Extraction result validation
- Integration with entity creation (auto-create properties/clients)
- Multi-language support

## Related Files

- `backend/src/routes/integrations.py` - Backend endpoint
- `src/api/integrations.ts` - Frontend function
- `backend/src/routes/upload.py` - File upload (files must be uploaded first)
- `.env.example` - Environment variables template

