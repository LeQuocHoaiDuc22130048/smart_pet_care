# Google OAuth Setup Guide

## Issue: 403 Error and FedCM Disabled

### Error Messages
```
Failed to load resource: the server responded with a status of 403
FedCM was disabled either temporarily based on previous user action or permanently via site settings
[GSI_LOGGER]: FedCM get() rejects with NetworkError: Error retrieving a token
```

### Root Cause
Google Identity Services uses FedCM (Federated Credential Management) API which can be:
1. Disabled by browser settings
2. Blocked by CORS policy
3. Restricted by Google OAuth consent screen configuration

## Solution Applied

### 1. Disable FedCM in Code
Added `use_fedcm_for_prompt: false` to Google Identity Services initialization:

```typescript
window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: async (response) => { /* ... */ },
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: false,  // ← Disable FedCM
});
```

### 2. Better Error Handling
Added specific error messages for different failure reasons:
- `suppressed_by_user` - User previously dismissed
- `opt_out_or_no_session` - User opted out or no session
- Other errors - Generic error message

## Google Cloud Console Configuration

### Step 1: Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**

### Step 2: Configure Authorized Origins

Add these to **Authorized JavaScript origins**:
```
http://localhost:5173
http://localhost:3000
https://your-production-domain.com
```

### Step 3: Configure Redirect URIs

Add these to **Authorized redirect URIs**:
```
http://localhost:5173/auth/google/callback
http://localhost:3000/auth/google/callback
https://your-production-domain.com/auth/google/callback
```

### Step 4: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for testing) or **Internal** (for organization)
3. Fill in required fields:
   - App name: **PetCare**
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (if using External with testing status)

### Step 5: Copy Client ID

1. Go back to **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Copy the **Client ID**
4. Add to `.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## Browser Configuration

### Enable Third-Party Cookies (Temporary)

If Google Sign-In still doesn't work:

#### Chrome
1. Go to `chrome://settings/cookies`
2. Select **Allow all cookies** (temporary for testing)
3. Or add exception for `accounts.google.com`

#### Firefox
1. Go to `about:preferences#privacy`
2. Set **Enhanced Tracking Protection** to **Standard**
3. Or add exception for `accounts.google.com`

#### Edge
1. Go to `edge://settings/content/cookies`
2. Select **Allow all cookies** (temporary for testing)
3. Or add exception for `accounts.google.com`

### Clear Browser Data

1. Clear cookies and cache for `accounts.google.com`
2. Clear site data for `localhost:5173`
3. Restart browser

## Testing

### Test Google Sign-In

1. Start frontend: `npm run dev`
2. Go to login or register page
3. Click **"Đăng ký với Google"** or **"Đăng nhập với Google"**
4. Google One Tap should appear
5. Select Google account
6. Should redirect to dashboard

### Troubleshooting

#### One Tap Doesn't Appear
- Check browser console for errors
- Verify Client ID in `.env.local`
- Check Authorized JavaScript origins in Google Console
- Try in incognito mode
- Clear browser cache

#### 403 Error
- Verify OAuth consent screen is configured
- Check if app is in testing status and user is added as test user
- Verify Authorized JavaScript origins match exactly

#### Network Error
- Check CORS configuration
- Verify backend endpoint is accessible
- Check if backend accepts Google ID tokens

#### "suppressed_by_user" Error
- User previously dismissed One Tap
- Clear cookies for `accounts.google.com`
- Or wait 2 hours for cooldown period

## Backend Configuration

### Identity Service Endpoint

Ensure backend has Google OAuth endpoint:
```
POST /api/v1/pet_care_identity/auth/google
Content-Type: application/json

{
    "idToken": "google-id-token-here"
}
```

### API Gateway Public Route

Ensure endpoint is public in `AuthenticationFilter.java`:
```java
new PublicRoute("POST", "/pet_care_identity/auth/google")
```

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8888/api/v1
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### Backend (application.yaml)
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid,email,profile
```

## Production Considerations

### 1. HTTPS Required
Google OAuth requires HTTPS in production:
- Use SSL certificate
- Update Authorized JavaScript origins to HTTPS URLs

### 2. Domain Verification
- Verify domain ownership in Google Search Console
- Add verified domain to OAuth consent screen

### 3. Security
- Never commit Client Secret to git
- Use environment variables
- Rotate secrets regularly
- Monitor OAuth usage in Google Console

### 4. Rate Limiting
- Google has rate limits for OAuth requests
- Implement exponential backoff for retries
- Cache tokens appropriately

## Alternative: Popup Flow

If One Tap continues to fail, implement popup flow:

```typescript
// Use OAuth 2.0 popup instead of One Tap
const client = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'openid email profile',
    callback: (response) => {
        // Handle access token
    },
});

client.requestAccessToken();
```

## References

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [FedCM API](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Troubleshooting](https://developers.google.com/identity/gsi/web/guides/troubleshooting)
