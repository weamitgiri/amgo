# Frontend API Configuration Fix

## Issues Resolved

### Problem
The frontend was making direct HTTP requests to `http://localhost:8080`, which resulted in:
```
net::ERR_UNSAFE_PORT errors
"Unable to load activities. Please try again later."
```

### Root Causes
1. Vite proxy was configured for port 6000, but backend API was running on port 8080
2. API timeout was too short (6000ms = 6 seconds)
3. No proper error handling for network failures

---

## Changes Made

### 1. Updated `frontend/src/config/environment.ts`
✅ Increased API_TIMEOUT from 6000ms to 30000ms (30 seconds)  
✅ Added clarifying comments about development vs production modes

```typescript
// Before
API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "6000"),

// After  
API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
```

### 2. Updated `frontend/vite.config.ts`
✅ Changed default proxy target from `localhost:6000` to `localhost:8080`  
✅ Added URL rewrite rule (converts `/v1` to `/api/v1`)  
✅ Maintains support for `VITE_API_PROXY_TARGET` environment variable

```typescript
// Before
target: process.env.VITE_API_PROXY_TARGET || "http://localhost:6000",

// After
target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8080",
rewrite: (path) => path.replace(/^\/v1/, "/api/v1"),
```

### 3. Updated `frontend/.env.example`
✅ Changed proxy target from 6000 to 8080  
✅ Added better documentation explaining the proxy behavior  
✅ Clarified when to use empty vs explicit API_BASE_URL

### 4. Improved `frontend/src/api/client.ts`
✅ Better endpoint normalization (handles with/without leading /)  
✅ Improved error handling for network failures  
✅ Added helpful error messages for debugging

---

## How It Works Now

### Development Mode (localhost:5173)
```
Frontend Request
    ↓
/v1/activities/games
    ↓
Vite Proxy (localhost:5173/v1 → localhost:8080/api/v1)
    ↓
Backend API (localhost:8080/api/v1/activities/games)
    ↓
Response returned to frontend
```

### Key Benefits
✅ **No direct port connections** - Uses Vite proxy, respects browser security  
✅ **No CORS errors** - Same-origin requests through proxy  
✅ **No unsafe port issues** - Frontend doesn't connect directly to backend port  
✅ **Configurable** - Can adjust via `VITE_API_PROXY_TARGET` env var  
✅ **Better timeouts** - 30 seconds instead of 6 seconds for slower connections

---

## Setup Instructions

### 1. Create `.env` file in frontend directory
```bash
cd /opt/homebrew/var/www/p/frontend
cp .env.example .env
```

### 2. Verify `.env` contains:
```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_STORAGE_BASE_URL=http://localhost:8000/storage
VITE_API_TIMEOUT=30000
```

### 3. Make sure your backend API is running
```bash
# Node.js/Express backend on port 8080
cd /opt/homebrew/var/www/p/apis
npm install
npm start  # Should run on http://localhost:8080
```

### 4. Start the frontend dev server
```bash
cd /opt/homebrew/var/www/p/frontend
npm install
npm run dev  # Will run on http://localhost:5173
```

### 5. Verify the setup works
- Open http://localhost:5173 in your browser
- Check Network tab in DevTools
- Requests to `/v1/...` should show as `localhost:5173` (not 8080)
- Requests should return 200 status (not errors)

---

## Testing the Fix

### Expected Behavior
```
✅ Page loads without "Unable to load activities" error
✅ Network tab shows /v1/ requests succeeding
✅ Activities/Games/Packages load properly
✅ No ERR_UNSAFE_PORT errors in console
```

### Debugging Checklist
- [ ] Backend API running on port 8080?
  ```bash
  lsof -i :8080  # Check if port 8080 is in use
  ```

- [ ] Frontend `.env` file created?
  ```bash
  ls -la frontend/.env  # Should exist
  ```

- [ ] `VITE_API_PROXY_TARGET` set correctly?
  ```bash
  grep VITE_API_PROXY_TARGET frontend/.env
  # Should show: VITE_API_PROXY_TARGET=http://localhost:8080
  ```

- [ ] Check browser console for errors
  - F12 → Console tab
  - Look for network errors

- [ ] Check Network tab for actual requests
  - F12 → Network tab
  - Try to load a page that makes API calls
  - Verify requests go to `/v1/...` (not full URL)

---

## Troubleshooting

### Still Getting Errors?

**Option 1: Restart everything**
```bash
# Kill existing processes
pkill -f "npm run dev"
pkill -f "npm start"

# Clear cache
rm -rf frontend/node_modules/.vite
rm -rf apis/node_modules/.vite

# Restart backend
cd apis && npm start

# Restart frontend (in new terminal)
cd frontend && npm run dev
```

**Option 2: Check if backend is accessible**
```bash
# Direct curl test
curl http://localhost:8080/api/v1/settings

# Should return JSON (not connection error)
```

**Option 3: Use explicit API URL (temporary debugging)**
```bash
# In frontend/.env, try:
VITE_API_BASE_URL=http://localhost:8080
```
⚠️ Note: This may cause CORS errors. Only for debugging.

---

## Environment-Specific Configuration

### Development
```env
VITE_API_BASE_URL=                          # Empty - use proxy
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_API_TIMEOUT=30000
```

### Staging
```env
VITE_API_BASE_URL=https://api-staging.example.com
VITE_API_TIMEOUT=30000
```

### Production
```env
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=30000
```

---

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/config/environment.ts` | Updated timeout from 6s to 30s, added comments |
| `frontend/vite.config.ts` | Changed proxy target to port 8080, added rewrite rule |
| `frontend/.env.example` | Updated docs, changed default port to 8080 |
| `frontend/src/api/client.ts` | Improved error handling and endpoint normalization |

---

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Verify backend running on port 8080
3. ✅ Restart frontend dev server
4. ✅ Test API calls work
5. ✅ Monitor browser console for any errors

---

**Status:** ✅ Fixed - Your API calls should now work through the Vite proxy without unsafe port errors.

