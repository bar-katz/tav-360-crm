# Feature Request: Signed URLs for Private Files

**Status:** 🔴 Not Implemented  
**Priority:** Medium  
**Category:** Integration

## Description

Implement signed URL generation for secure, time-limited access to private files. This enables:
- Secure sharing of sensitive documents
- Time-limited access to files
- Private file access without authentication
- Sharing files with external parties securely

## Current Status

- ✅ Backend endpoint exists: `POST /api/integrations/signed-url`
- ✅ Frontend function exists: `CreateFileSignedUrl()` in `src/api/integrations.ts`
- ⚠️ Returns placeholder response: `{success: false, message: "Signed URL service not configured"}`

## Implementation Requirements

### Backend Implementation

**Location:** `backend/src/routes/integrations.py` - `create_signed_url()` function

**Options for Signed URL Generation:**

1. **AWS S3 Pre-signed URLs**
   - Use `boto3` to generate S3 pre-signed URLs
   - Files stored in S3 buckets
   - Configurable expiration time

2. **Azure Blob Storage SAS URLs**
   - Use Azure SDK to generate Shared Access Signatures
   - Files stored in Azure Blob Storage
   - Fine-grained access control

3. **Google Cloud Storage Signed URLs**
   - Use Google Cloud Storage SDK
   - Files stored in GCS buckets
   - Configurable permissions

4. **Local File System (Custom Implementation)**
   - Generate tokens for file access
   - Store tokens in database with expiration
   - Serve files through authenticated endpoint

**Environment Variables Needed:**
```bash
STORAGE_PROVIDER=s3|azure|gcs|local
# For AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
# For Azure
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
AZURE_STORAGE_CONTAINER=your-container
# For Google Cloud
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GCS_BUCKET_NAME=your-bucket
```

**Request Format:**
```json
{
  "file_path": "private/documents/contract-123.pdf",
  "expiration_minutes": 60
}
```

**Response Format:**
```json
{
  "success": true,
  "signed_url": "https://storage.example.com/file.pdf?signature=abc123&expires=1234567890",
  "expires_at": "2024-01-01T13:00:00Z",
  "expires_in_minutes": 60
}
```

### Frontend Usage

Already implemented in `src/api/integrations.ts`:
```typescript
const result = await CreateFileSignedUrl({
  file_path: "private/documents/contract-123.pdf",
  expiration_minutes: 60
});
// Share the signed_url with external party
```

## Use Cases

1. **Secure Document Sharing**
   - Share contracts with clients
   - Share property documents with buyers
   - Share sensitive files with external parties

2. **Time-Limited Access**
   - Grant temporary access to documents
   - Share files that expire automatically
   - Control access duration

3. **External Integration**
   - Share files with third-party services
   - Provide file access to webhooks
   - Enable file downloads without authentication

4. **Audit Trail**
   - Track file access
   - Monitor who accessed files
   - Log file downloads

## Dependencies

- Cloud storage SDK (boto3, Azure SDK, Google Cloud SDK)
- OR custom token generation system
- Database for token storage (if using local implementation)

## Testing

- Test URL expiration
- Test access permissions
- Test with different file types
- Test error handling (expired URLs, invalid files)
- Test security (unauthorized access attempts)

## Security Considerations

- Validate file paths (prevent directory traversal)
- Implement proper expiration times
- Use secure signature algorithms
- Log all signed URL generation
- Monitor for abuse
- Consider IP restrictions
- Implement revocation mechanism

## Future Enhancements

- Download limits per URL
- IP whitelisting for signed URLs
- Password protection for URLs
- Access logging and analytics
- URL revocation before expiration
- Custom access permissions (read-only, etc.)

## Related Files

- `backend/src/routes/integrations.py` - Backend endpoint
- `src/api/integrations.ts` - Frontend function
- `backend/src/routes/upload.py` - File upload (files must be uploaded first)
- `.env.example` - Environment variables template

