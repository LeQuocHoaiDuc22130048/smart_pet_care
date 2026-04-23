# Google OAuth Troubleshooting Guide

## Common Issues and Solutions

### 1. Popup Blocked

**Error**: "Popup bị chặn. Vui lòng cho phép popup cho trang này."

**Cause**: Browser is blocking popups

**Solutions**:

#### Chrome
1. Click the popup blocked icon in address bar (right side)
2. Select "Always allow popups from localhost:5173"
3. Try again

#### Firefox
1. Click the popup blocked icon in address bar
2. Select "Allow popups for localhost:5173"
3. Try again

#### Edge
1. Click the popup blocked icon in address bar
2. Select "Always allow popups from localhost:5173"
3. Try again

### 2. 403 Forbidden Error

**Error**: "Failed to load resource: the server responded with a status of 403"

**Cause**: Google OAuth configuration issue

**Solutions**:

1. **Check Authorized JavaScript Origins**:
   - Go to Google Cloud Console
   - Navigate to Credentials
   - Edit OAuth 2.0 Client ID
   - Add `http://localhost:5173` to Authorized JavaScript origins
   - Save

2. **Check Authorized Redirect URIs**:
   - Add `http://localhost:5173/auth/google/callback`
   - Make sure there are no trailing slashes
   - Save and wait 5 minutes for changes to propagate

3. **Check OAuth Consent Screen**:
   - Make sure app is not in "Testing" status with no test users
   - Or add your email as a test user
   - Or publish the app (for production)

### 3. FedCM Disabled Warning

**Warning**: "FedCM was disabled either temporarily based on previous user action or permanently via site settings"

**Cause**: This is expected - we're not using FedCM anymore

**Solution**: Ignore this warning. We're using popup flow instead.

### 4. Popup Closes Immediately

**Error**: Popup opens and closes immediately without showing Google login

**Causes & Solutions**:

1. **Invalid Client ID**:
   - Check `.env.local` has correct `VITE_GOOGLE_CLIENT_ID`
   - Verify Client ID in Google Cloud Console
   - Make sure no extra spaces or quotes

2. **Invalid Redirect URI**:
   - Check `.env.local` has correct `VITE_GOOGLE_REDIRECT_URI`
   - Must match exactly with Google Cloud Console
   - Include protocol (http:// or https://)

3. **Browser Extensions**:
   - Disable ad blockers
   - Disable privacy extensions
   - Try in incognito mode

### 5. "No ID Token Received"

**Error**: Popup closes with error "No ID token received"

**Causes & Solutions**:

1. **Wrong Response Type**:
   - Make sure using `response_type=id_token`
   - Not `response_type=code` or `response_type=token`

2. **Missing Scope**:
   - Make sure scope includes `openid`
   - Full scope: `openid email profile`

3. **Nonce Missing**:
   - Make sure nonce is included in request
   - Nonce should be random string

### 6. Backend Authentication Fails

**Error**: "Đăng nhập Google thất bại" after popup closes

**Causes & Solutions**:

1. **Backend Not Configured**:
   - Check backend has Google OAuth endpoint
   - Endpoint: `POST /api/v1/pet_care_identity/auth/google`
   - Should accept `{ idToken: string }`

2. **Invalid ID Token**:
   - Backend must validate ID token
   - Check Google Client ID matches
   - Verify token signature
   - Check token expiration

3. **CORS Error**:
   - Check backend CORS configuration
   - Allow origin: `http://localhost:5173`
   - Allow credentials: true

### 7. Redirect Loop

**Error**: Page keeps redirecting back and forth

**Causes & Solutions**:

1. **Callback Page Not Found**:
   - Make sure route exists: `/auth/google/callback`
   - Check `routes.tsx` has GoogleCallbackPage

2. **postMessage Not Working**:
   - Check origin verification
   - Make sure parent window exists
   - Check popup is not blocked

### 8. Mobile Issues

**Error**: Popup doesn't work well on mobile

**Solutions**:

1. **Use Redirect Flow**:
   - Detect mobile device
   - Use `window.location.href` instead of `window.open`
   - Handle callback differently

2. **Responsive Popup**:
   - Adjust popup size for mobile
   - Use fullscreen on small screens

## Testing Checklist

- [ ] Popup opens when clicking Google button
- [ ] Google login page appears in popup
- [ ] Can select Google account
- [ ] Can grant permissions
- [ ] Popup closes automatically after success
- [ ] Redirected to dashboard
- [ ] User is logged in
- [ ] Error shown if popup blocked
- [ ] Error shown if user closes popup
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works in incognito mode
- [ ] Works with ad blocker disabled

## Debug Mode

Enable debug logging:

```typescript
// In useGoogleLogin.ts
console.log('Opening Google OAuth popup');
console.log('Auth URL:', authUrl.toString());
console.log('Popup opened:', !!popup);

// In GoogleCallbackPage.tsx
console.log('Callback page loaded');
console.log('Hash:', window.location.hash);
console.log('ID Token:', idToken);
```

## Browser Console Errors

### "Blocked a frame with origin..."
- CORS issue
- Check backend CORS configuration
- Make sure origin matches exactly

### "postMessage target origin..."
- Origin mismatch
- Check origin verification in code
- Make sure using `window.location.origin`

### "Cannot read property 'postMessage' of null"
- Parent window closed
- Popup opened in new tab instead of popup
- Check popup parameters

## Network Tab

Check Network tab in browser DevTools:

1. **OAuth Request**:
   - Should see request to `accounts.google.com/o/oauth2/v2/auth`
   - Status: 302 (redirect)
   - Check query parameters

2. **Callback Request**:
   - Should see request to `/auth/google/callback`
   - Status: 200
   - Check hash fragment

3. **Backend Request**:
   - Should see POST to `/api/v1/pet_care_identity/auth/google`
   - Status: 200
   - Check request body has idToken
   - Check response has token

## Still Not Working?

1. **Clear Everything**:
   ```bash
   # Clear browser cache
   # Clear cookies for accounts.google.com
   # Clear localStorage
   # Restart browser
   ```

2. **Try Incognito**:
   - Open incognito window
   - Test Google login
   - If works, issue is with browser state

3. **Check Google Status**:
   - Visit [Google Cloud Status](https://status.cloud.google.com/)
   - Check if OAuth services are down

4. **Contact Support**:
   - Check Google OAuth documentation
   - Post on Stack Overflow
   - Check GitHub issues

## Production Checklist

Before deploying to production:

- [ ] Use HTTPS
- [ ] Update Authorized JavaScript origins to production domain
- [ ] Update Authorized redirect URIs to production domain
- [ ] Update environment variables
- [ ] Test with real users
- [ ] Monitor error logs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document for team
- [ ] Create runbook for common issues
