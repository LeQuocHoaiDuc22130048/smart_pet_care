# Google OAuth Popup Flow (FedCM Alternative)

## Why Popup Flow?

FedCM (Federated Credential Management) API causes 403 errors and can be disabled by:
- Browser settings
- User previous actions
- Site policies

**Solution**: Use traditional OAuth 2.0 popup flow instead of Google One Tap.

## Implementation

### 1. OAuth Popup Flow

Instead of Google One Tap (which uses FedCM), we use OAuth 2.0 implicit flow:

```typescript
// Build OAuth URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'id_token');  // Get ID token directly
authUrl.searchParams.set('scope', 'openid email profile');
authUrl.searchParams.set('nonce', nonce);
authUrl.searchParams.set('prompt', 'select_account');

// Open popup
const popup = window.open(authUrl.toString(), 'Google Sign In', 'width=500,height=600');
```

### 2. Callback Page

When user completes authentication, Google redirects to callback page with ID token in hash fragment:

```
http://localhost:5173/auth/google/callback#id_token=eyJhbGc...&expires_in=3600
```

Callback page (`GoogleCallbackPage.tsx`):
1. Parses hash fragment
2. Extracts `id_token`
3. Sends token to parent window via `postMessage`
4. Closes popup

### 3. Parent Window

Parent window listens for `postMessage`:
1. Receives ID token from popup
2. Sends token to backend
3. Logs in user
4. Redirects to dashboard

## Flow Diagram

```
┌─────────────┐
│   User      │
│  clicks     │
│  "Google"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  useGoogleLogin Hook                │
│  - Build OAuth URL                  │
│  - Open popup window                │
│  - Listen for postMessage           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Google OAuth Popup                 │
│  - User selects account             │
│  - User grants permissions          │
│  - Redirects to callback            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  GoogleCallbackPage                 │
│  - Parse hash fragment              │
│  - Extract id_token                 │
│  - postMessage to parent            │
│  - Close popup                      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Parent Window                      │
│  - Receive id_token                 │
│  - Call backend API                 │
│  - Login user                       │
│  - Navigate to dashboard            │
└─────────────────────────────────────┘
```

## Advantages

### ✅ No FedCM Issues
- Doesn't use FedCM API
- Works in all browsers
- No 403 errors

### ✅ Better Browser Support
- Works with third-party cookies disabled
- Works in incognito mode
- Works with strict privacy settings

### ✅ User Control
- User can see and control popup
- Clear visual feedback
- Can close popup anytime

### ✅ Standard OAuth 2.0
- Well-documented
- Widely supported
- Battle-tested

## Disadvantages

### ❌ Popup Blockers
- May be blocked by browser
- User needs to allow popups
- Show clear error message

### ❌ Less Seamless
- Not as smooth as One Tap
- Requires popup window
- Extra click to close

### ❌ Mobile Experience
- Popup may be awkward on mobile
- Consider redirect flow for mobile

## Configuration

### Google Cloud Console

1. **Authorized JavaScript origins**:
```
http://localhost:5173
https://your-domain.com
```

2. **Authorized redirect URIs**:
```
http://localhost:5173/auth/google/callback
https://your-domain.com/auth/google/callback
```

### Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## Security Considerations

### 1. Origin Verification
```typescript
if (event.origin !== window.location.origin) {
    return; // Ignore messages from other origins
}
```

### 2. Nonce Validation
```typescript
const nonce = Math.random().toString(36).substring(2);
// Send nonce in OAuth request
// Verify nonce in ID token (backend)
```

### 3. HTTPS in Production
- Always use HTTPS in production
- HTTP only for local development
- Update redirect URIs accordingly

### 4. Token Validation
- Backend must validate ID token
- Check signature
- Verify issuer (accounts.google.com)
- Check audience (your client ID)
- Check expiration

## Error Handling

### Popup Blocked
```typescript
if (!popup) {
    toast.error('Popup bị chặn. Vui lòng cho phép popup cho trang này.');
    return;
}
```

### Popup Closed
```typescript
const checkClosed = setInterval(() => {
    if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('Popup closed'));
    }
}, 500);
```

### OAuth Error
```typescript
if (event.data.type === 'GOOGLE_AUTH_ERROR') {
    toast.error('Đăng nhập Google thất bại');
    reject(new Error(event.data.error));
}
```

## Testing

### Test Popup Flow

1. Click "Đăng ký với Google"
2. Popup should open
3. Select Google account
4. Grant permissions
5. Popup closes automatically
6. Redirected to dashboard

### Test Error Cases

1. **Popup blocked**: Disable popup blocker
2. **User closes popup**: Should show error
3. **Network error**: Should show error
4. **Invalid token**: Backend should reject

## Mobile Considerations

### Redirect Flow for Mobile

For better mobile experience, consider redirect flow instead of popup:

```typescript
// Detect mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
    // Use redirect flow
    window.location.href = authUrl.toString();
} else {
    // Use popup flow
    window.open(authUrl.toString(), ...);
}
```

### Callback Handling

For redirect flow, callback page should:
1. Extract token from hash
2. Store in sessionStorage
3. Redirect to original page
4. Original page reads token and logs in

## Comparison: One Tap vs Popup

| Feature | One Tap (FedCM) | Popup Flow |
|---------|----------------|------------|
| User Experience | ⭐⭐⭐⭐⭐ Seamless | ⭐⭐⭐ Good |
| Browser Support | ⭐⭐ Limited | ⭐⭐⭐⭐⭐ Universal |
| Privacy Settings | ⭐⭐ Sensitive | ⭐⭐⭐⭐ Robust |
| Mobile Experience | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Okay |
| Setup Complexity | ⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate |
| Reliability | ⭐⭐ Can fail | ⭐⭐⭐⭐⭐ Reliable |

## Migration from One Tap

If you were using One Tap before:

1. Remove Google Identity Services script
2. Implement popup flow
3. Update callback handling
4. Test thoroughly
5. Update documentation

## Future: FedCM Support

When FedCM becomes stable and widely supported:

1. Detect FedCM support
2. Use FedCM if available
3. Fallback to popup if not
4. Provide best experience for each browser

```typescript
const supportsFedCM = 'IdentityCredential' in window;

if (supportsFedCM) {
    // Use FedCM (One Tap)
} else {
    // Use popup flow
}
```

## References

- [OAuth 2.0 Implicit Flow](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Google Sign-In](https://developers.google.com/identity/sign-in/web)
- [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
