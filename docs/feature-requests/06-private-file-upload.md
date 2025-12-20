# Feature Request: Private File Upload

**Status:** 🔴 Not Implemented  
**Priority:** Medium  
**Category:** Integration

## Description

Implement private file upload functionality with access control. This enables:
- Uploading sensitive documents
- Storing files with restricted access
- Organizing files by user/role permissions
- Secure file storage separate from public uploads

## Current Status

- ✅ Backend endpoint exists: `POST /api/integrations/upload-private`
- ✅ Frontend function exists: `UploadPrivateFile()` in `src/api/integrations.ts`
- ⚠️ Returns placeholder response: `{success: false, message: "Private file storage not configured"}`

## Implementation Requirements

### Backend Implementation

**Location:** `backend/src/routes/integrations.py` - `upload_private_file()` function

**Options for Private File Storage:**

1. **Cloud Storage with Access Control**
   - AWS S3 with IAM policies
   - Azure Blob Storage with access policies
   - Google Cloud Storage with IAM
   - Files stored in private buckets/containers

2. **Local File System with Database Tracking**
   - Store files in protected directory
   - Track file ownership/permissions in database
   - Serve files through authenticated endpoint

3. **Encrypted File Storage**
   - Encrypt files before storage
   - Store encryption keys securely
   - Decrypt on authorized access

**Environment Variables Needed:**
```bash
PRIVATE_STORAGE_PROVIDER=s3|azure|gcs|local
PRIVATE_STORAGE_PATH=private/
# For AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_PRIVATE_BUCKET=private-bucket-name
# For Azure
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
AZURE_STORAGE_PRIVATE_CONTAINER=private-container
# For Google Cloud
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GCS_PRIVATE_BUCKET=private-bucket
```

**Request Format:**
```json
{
  "file": "<File object>",
  "folder": "contracts",
  "access_level": "private|shared|public",
  "allowed_users": [1, 2, 3],
  "allowed_roles": ["admin", "office_manager"]
}
```

**Response Format:**
```json
{
  "success": true,
  "file_url": "https://backend.example.com/api/files/private/abc123.pdf",
  "file_id": "abc123",
  "access_level": "private",
  "uploaded_by": 1,
  "uploaded_at": "2024-01-01T12:00:00Z"
}
```

### Frontend Usage

Already implemented in `src/api/integrations.ts`:
```typescript
const result = await UploadPrivateFile({
  file: fileObject,
  folder: "contracts",
  access_level: "private"
});
```

## Use Cases

1. **Sensitive Documents**
   - Upload contracts
   - Store legal documents
   - Upload financial records

2. **Role-Based Access**
   - Admin-only documents
   - Department-specific files
   - User-specific files

3. **Secure Sharing**
   - Share files with specific users
   - Control file access permissions
   - Track file access

4. **Compliance**
   - Store files with retention policies
   - Implement file access logging
   - Meet data protection requirements

## Database Schema Addition

May need to add a `private_files` table:
```sql
CREATE TABLE private_files (
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id),
    folder VARCHAR(100),
    access_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE file_permissions (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES private_files(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50),
    permission VARCHAR(50), -- read, write, delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Dependencies

- Cloud storage SDK (if using cloud storage)
- Database models for file tracking
- Access control middleware
- File serving endpoint with authentication

## Testing

- Test file upload with different permissions
- Test access control (authorized/unauthorized access)
- Test file deletion
- Test file sharing
- Test error handling

## Security Considerations

- Validate file types and sizes
- Implement access control checks
- Encrypt sensitive files
- Log all file access
- Implement file scanning (virus/malware)
- Set file size limits
- Implement rate limiting
- Consider data retention policies

## Future Enhancements

- File versioning
- File sharing links
- File preview generation
- File metadata extraction
- File search functionality
- Bulk file operations
- File expiration/auto-deletion
- Integration with signed URLs

## Related Files

- `backend/src/routes/integrations.py` - Backend endpoint
- `src/api/integrations.ts` - Frontend function
- `backend/src/routes/upload.py` - Public file upload (reference implementation)
- `backend/src/models/` - Database models (may need new models)
- `.env.example` - Environment variables template

