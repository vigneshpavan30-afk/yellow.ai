# Deployment Guide - Yellow Bank Banking Agent

## Issues Fixed

### 1. API URL Configuration
**Problem:** Frontend was hardcoded to `http://localhost:3000`, which only worked on local machine.

**Solution:** Changed to `window.location.origin` which automatically detects the current domain.

```javascript
// Before (only worked locally)
const API_BASE_URL = 'http://localhost:3000';

// After (works everywhere)
const API_BASE_URL = window.location.origin;
```

### 2. CORS Configuration
**Problem:** CORS might block requests from different domains.

**Solution:** Updated CORS to allow all origins for deployed version.

```javascript
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Session-Id']
}));
```

### 3. Performance Optimizations
- AI timeout reduced from 5s to 3s
- Intent detection timeout: 2s
- Standard responses for common flows (no AI wait)
- Instant validation responses (no AI calls)

## Deployment Checklist

1. ✅ API URL is dynamic (works on any domain)
2. ✅ CORS configured for all origins
3. ✅ Performance optimizations applied
4. ✅ All files committed and pushed to GitHub

## Testing on Deployed Site

The site at https://yellow-ai-o8wq.onrender.com should now:
- ✅ Work on any computer/device
- ✅ Make API calls to the same domain
- ✅ Respond quickly (optimized timeouts)
- ✅ Handle CORS properly

## If Issues Persist

1. **Clear browser cache** - Old JavaScript might be cached
2. **Hard refresh** - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check browser console** - Look for any error messages
4. **Verify deployment** - Ensure Render has pulled latest code from GitHub
