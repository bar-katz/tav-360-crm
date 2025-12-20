/**
 * Integration functions - file uploads, email, etc.
 * Replaces Base44 integrations
 */
import config from '@/config';

export interface UploadFileResponse {
  file_url: string;
  file_id?: string;
}

/**
 * Upload a file to the backend
 * @param file - File object to upload
 * @returns Promise with file URL
 */
export async function UploadFile({ file }: { file: File }): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = config.api.baseUrl;
  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  const data = await response.json();
  return { file_url: data.url || data.file_url };
}

/**
 * Send email
 * Backend endpoint exists but returns placeholder response.
 * Configure email service (SMTP/SendGrid/etc.) in backend to enable.
 */
export async function SendEmail(params: any): Promise<any> {
  const baseUrl = config.api.baseUrl;
  const token = localStorage.getItem('token');
  const response = await fetch(`${baseUrl}/integrations/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Email send failed');
  const result = await response.json();
  if (!result.success) {
    console.warn('Email service not configured:', result.message);
  }
  return result;
}

/**
 * Invoke LLM
 * Backend endpoint exists but returns placeholder response.
 * Configure LLM service (OpenAI/Anthropic/etc.) in backend to enable.
 */
export async function InvokeLLM(params: any): Promise<any> {
  const baseUrl = config.api.baseUrl;
  const token = localStorage.getItem('token');
  const response = await fetch(`${baseUrl}/integrations/llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('LLM invocation failed');
  const result = await response.json();
  if (!result.success) {
    console.warn('LLM service not configured:', result.message);
  }
  return result;
}

/**
 * Generate image
 * Backend endpoint exists but returns placeholder response.
 * Configure image generation service (DALL-E/Stable Diffusion/etc.) in backend to enable.
 */
export async function GenerateImage(params: any): Promise<any> {
  const baseUrl = config.api.baseUrl;
  const token = localStorage.getItem('token');
  const response = await fetch(`${baseUrl}/integrations/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Image generation failed');
  const result = await response.json();
  if (!result.success) {
    console.warn('Image generation service not configured:', result.message);
  }
  return result;
}

/**
 * Extract data from uploaded file
 * Backend endpoint exists but returns placeholder response.
 * Configure data extraction service (PDF parsing/OCR/etc.) in backend to enable.
 */
export async function ExtractDataFromUploadedFile(params: any): Promise<any> {
  const baseUrl = config.api.baseUrl;
  const token = localStorage.getItem('token');
  const response = await fetch(`${baseUrl}/integrations/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Data extraction failed');
  const result = await response.json();
  if (!result.success) {
    console.warn('Data extraction service not configured:', result.message);
  }
  return result;
}

/**
 * Create file signed URL
 * Backend endpoint exists but returns placeholder response.
 * Configure cloud storage (S3/Azure Blob/etc.) in backend to enable.
 */
export async function CreateFileSignedUrl(params: any): Promise<any> {
  const baseUrl = config.api.baseUrl;
  const token = localStorage.getItem('token');
  const response = await fetch(`${baseUrl}/integrations/signed-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Signed URL creation failed');
  const result = await response.json();
  if (!result.success) {
    console.warn('Signed URL service not configured:', result.message);
  }
  return result;
}

/**
 * Upload private file
 * Backend endpoint exists but returns placeholder response.
 * Configure private file storage with access control in backend to enable.
 */
export async function UploadPrivateFile(params: any): Promise<any> {
  const baseUrl = config.api.baseUrl;
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (params.file) formData.append('file', params.file);
  
  const response = await fetch(`${baseUrl}/integrations/upload-private`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Private file upload failed');
  const result = await response.json();
  if (!result.success) {
    console.warn('Private file storage not configured:', result.message);
  }
  return result;
}

export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
  CreateFileSignedUrl,
  UploadPrivateFile,
};

