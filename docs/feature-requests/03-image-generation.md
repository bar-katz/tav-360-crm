# Feature Request: Image Generation

**Status:** 🔴 Not Implemented  
**Priority:** Low  
**Category:** Integration

## Description

Implement AI-powered image generation to create property images, marketing materials, and visual content for the CRM. This could enable:
- Generating property visualization images
- Creating marketing banners
- Generating property floor plans
- Creating social media content

## Current Status

- ✅ Backend endpoint exists: `POST /api/integrations/image`
- ✅ Frontend function exists: `GenerateImage()` in `src/api/integrations.ts`
- ⚠️ Returns placeholder response: `{success: false, message: "Image generation service not configured"}`

## Implementation Requirements

### Backend Implementation

**Location:** `backend/src/routes/integrations.py` - `generate_image()` function

**Options for Image Generation Service:**

1. **OpenAI DALL-E**
   - High-quality image generation
   - Requires OpenAI API key
   - Good for creative images

2. **Stable Diffusion (via API)**
   - Open-source model
   - Various API providers (Stability AI, Replicate)
   - More control over generation

3. **Midjourney (via API)**
   - High-quality artistic images
   - Requires Midjourney API access
   - Good for marketing materials

4. **Local Stable Diffusion**
   - Self-hosted solution
   - No API costs
   - Requires GPU infrastructure

**Environment Variables Needed:**
```bash
IMAGE_GENERATION_PROVIDER=dalle|stability|midjourney|local
OPENAI_API_KEY=your-openai-key
# OR for Stability AI
STABILITY_API_KEY=your-stability-key
# OR for local
IMAGE_GEN_BASE_URL=http://localhost:7860
IMAGE_GEN_MODEL=stable-diffusion-v1-5
```

**Request Format:**
```json
{
  "prompt": "Modern 3-bedroom apartment interior, bright and spacious, Tel Aviv style",
  "size": "1024x1024",
  "style": "realistic"
}
```

**Response Format:**
```json
{
  "success": true,
  "image_url": "https://backend.example.com/uploads/generated-12345.png",
  "prompt": "Original prompt used",
  "model": "dall-e-3",
  "cost": 0.04
}
```

### Frontend Usage

Already implemented in `src/api/integrations.ts`:
```typescript
const result = await GenerateImage({
  prompt: "Modern apartment living room",
  size: "1024x1024",
  style: "realistic"
});
```

## Use Cases

1. **Property Visualization**
   - Generate property images when photos aren't available
   - Create virtual staging images
   - Generate floor plan visualizations

2. **Marketing Materials**
   - Create property listing banners
   - Generate social media images
   - Create email header images

3. **Documentation**
   - Generate property concept images
   - Create presentation graphics
   - Generate report visuals

## Dependencies

- Image generation API SDK
- Image processing library (Pillow) for post-processing
- File upload system (already exists)

## Testing

- Test with various prompts
- Test different image sizes
- Test error handling
- Test image quality
- Test cost tracking

## Security Considerations

- Validate prompts (prevent inappropriate content)
- Implement rate limiting
- Store API keys securely
- Log image generation for audit
- Consider content moderation

## Cost Considerations

- Image generation APIs can be expensive
- Implement usage tracking
- Set cost limits
- Cache generated images when possible
- Consider local generation for cost savings

## Future Enhancements

- Image editing capabilities
- Batch image generation
- Style presets for properties
- Integration with property photos
- Image upscaling/enhancement

## Related Files

- `backend/src/routes/integrations.py` - Backend endpoint
- `src/api/integrations.ts` - Frontend function
- `backend/src/routes/upload.py` - File upload (for saving generated images)
- `.env.example` - Environment variables template

