# 🚀 Facebook/Instagram OAuth Setup Guide

## ✨ Why Social Login?

- ✅ **100% FREE** - No email/SMS costs
- ✅ **Verifies real users** - Facebook/Instagram accounts only
- ✅ **Better UX** - One-click login
- ✅ **Auto profile** - Get name, email, profile picture automatically
- ✅ **500M+ users** - Nearly everyone has Facebook/Instagram

---

## 📋 Quick Setup (10 minutes)

### Step 1: Create Facebook App

1. **Go to** https://developers.facebook.com/
2. **Click** "My Apps" → "Create App"
3. **Select** "Consumer" as app type
4. **Fill in**:
   - App Name: `Family Tree` (or your app name)
   - App Contact Email: Your email
5. **Click** "Create App"

### Step 2: Get App Credentials

1. In your app dashboard, find **App ID** and **App Secret**
2. Copy both values (you'll need them)

### Step 3: Add Facebook Login Product

1. In left sidebar, click **"Add Product"**
2. Find **"Facebook Login"** → Click **"Set Up"**
3. Select **"Web"** platform
4. Enter Site URL: `http://localhost:3001` (for development)
5. Click **Save**

### Step 4: Configure OAuth Redirect URIs

1. Left sidebar → **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs**, add:
   ```
   http://localhost:3001/api/v1/social-auth/facebook/callback
   http://localhost:3001/api/v1/social-auth/instagram/callback
   ```
3. **Click** "Save Changes"

### Step 5: Enable Instagram Login (Optional)

1. Left sidebar → **Add Product**
2. Find **"Instagram Basic Display"** → Click **"Set Up"**
3. Follow prompts (uses same Facebook App ID)

### Step 6: Update docker-compose.yml

Open `docker-compose.yml` and add these environment variables to `api-service`:

```yaml
api-service:
  environment:
    # ... existing vars ...
    
    # Facebook/Instagram OAuth (FREE!)
    FACEBOOK_APP_ID: your_app_id_here
    FACEBOOK_APP_SECRET: your_app_secret_here
    SESSION_SECRET: your_random_secret_here_change_this
```

**Generate SESSION_SECRET** (run this in PowerShell):
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 7: Update Database Schema

```powershell
cd services/api-service
docker-compose exec api-service npx prisma db push --accept-data-loss
```

### Step 8: Install Dependencies & Restart

```powershell
docker-compose exec api-service npm install
docker-compose restart api-service
```

---

## 🧪 Test It!

1. **Open** http://localhost:3000/login
2. **Click** "Continue with Facebook" or "Continue with Instagram"
3. **Log in** with your Facebook/Instagram account
4. **Authorize** the app
5. **Done!** You're logged in ✨

---

## 📊 What Happens Behind the Scenes

1. User clicks "Continue with Facebook"
2. Redirected to Facebook login page
3. User authorizes your app
4. Facebook redirects back with OAuth token
5. Backend exchanges token for user data
6. User profile created/linked in database
7. Session token created
8. User logged in automatically

---

## 🔐 Security & Privacy

- ✅ No passwords stored (Facebook handles authentication)
- ✅ Users can revoke access anytime from Facebook settings
- ✅ Only requested data is accessed (email, name, profile picture)
- ✅ OAuth 2.0 standard security protocol
- ✅ Session tokens expire after 7 days

---

## 🌐 Production Deployment Checklist

### 1. Update App Settings

In Facebook App Dashboard:

**Settings → Basic**:
- App Domains: `yourdomain.com`
- Privacy Policy URL: `https://yourdomain.com/privacy`
- Terms of Service URL: `https://yourdomain.com/terms`

**Facebook Login → Settings**:
- Valid OAuth Redirect URIs:
  ```
  https://yourdomain.com/api/v1/social-auth/facebook/callback
  https://yourdomain.com/api/v1/social-auth/instagram/callback
  ```

### 2. Update Environment Variables

```yaml
FACEBOOK_APP_ID: your_app_id
FACEBOOK_APP_SECRET: your_app_secret
API_BASE_URL: https://yourdomain.com
FRONTEND_URL: https://yourdomain.com
SESSION_SECRET: strong_random_secret_here
NODE_ENV: production
```

### 3. Submit for Review (if needed)

For public apps >100 users:
1. Go to App Review
2. Submit permissions for review:
   - `email`
   - `public_profile`

---

## 🎨 Customization

### Change Button Colors

Edit [frontend/src/app/login/page.tsx](frontend/src/app/login/page.tsx):

```tsx
// Facebook button
className="bg-[#1877F2] hover:bg-[#166FE5]"

// Instagram button
className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"
```

### Add More Social Providers

You can add:
- Google OAuth (passport-google-oauth20)
- Twitter/X (passport-twitter)
- GitHub (passport-github2)

---

## 🛠️ Troubleshooting

### "App Not Set Up" Error

**Solution**: Make sure Facebook Login product is added and configured

### "Can't Load URL" Error

**Solution**: Check OAuth Redirect URIs match exactly (http://localhost:3001/...)

### "Invalid App ID" Error

**Solution**: Double-check FACEBOOK_APP_ID in docker-compose.yml

### Facebook Login Works, But No User Created

**Solution**: Check Docker logs:
```powershell
docker-compose logs -f api-service | Select-String "Facebook"
```

### Want to Test Without Facebook Account?

**Solution**: Use email auth instead:
- Email OTP (6-digit codes in Docker logs)
- Magic links (click link in Docker logs)

---

## 📝 Environment Variables Reference

```yaml
# Required
FACEBOOK_APP_ID=123456789012345          # From Facebook App Dashboard
FACEBOOK_APP_SECRET=abcdef1234567890abcd # From Facebook App Dashboard
SESSION_SECRET=random-32-char-string     # Generate yourself

# Optional (auto-detected)
API_BASE_URL=http://localhost:3001       # Your API URL
FRONTEND_URL=http://localhost:3000       # Your frontend URL
NODE_ENV=development                     # development | production
```

---

## 🎯 Quick Commands

```powershell
# Check if Facebook auth is configured
docker-compose logs api-service | Select-String "Facebook"

# See all social login attempts
docker-compose logs -f api-service | Select-String "Facebook|Instagram|social"

# Restart after config changes
docker-compose restart api-service

# Update database schema
docker-compose exec api-service npx prisma db push

# View database
docker-compose exec api-service npx prisma studio
```

---

## ✅ Benefits Over Email/SMS

| Feature | Facebook/Instagram | Email OTP | Phone SMS |
|---------|-------------------|-----------|-----------|
| **Cost** | FREE | FREE | Paid ($) |
| **Setup Time** | 10 min | 5 min | 15 min |
| **User Verification** | ✅ Real accounts | ✅ Real email | ✅ Real phone |
| **UX** | 1-click | Enter code | Enter code |
| **Profile Data** | Name, photo, email | Email only | Phone only |
| **Maintenance** | No emails to send | Send ~100/day | Pay per SMS |

---

## 🌟 Best Practices

1. **Always offer multiple login options**:
   - Facebook/Instagram (social)
   - Email (magic link + OTP)
   - Phone (OTP) - if needed

2. **Link accounts**: If user signs in with Facebook, then email, link both to same profile

3. **Store minimal data**: Only request what you need (email, name, profile picture)

4. **Respect privacy**: Let users delete accounts and data

5. **Session management**: Implement logout, session expiry, token refresh

---

## 🎉 You're Done!

Your family tree app now has:
- ✅ Free social login
- ✅ Real user verification
- ✅ One-click authentication
- ✅ Zero email/SMS costs
- ✅ Professional user experience

**Next steps**:
1. Test login flow
2. Add user profile page
3. Deploy to production
4. Submit Facebook app for review (if >100 users)

---

## 📚 Resources

- **Facebook for Developers**: https://developers.facebook.com/
- **Facebook Login Docs**: https://developers.facebook.com/docs/facebook-login/
- **Instagram Basic Display**: https://developers.facebook.com/docs/instagram-basic-display-api/
- **Passport.js Facebook Strategy**: http://www.passportjs.org/packages/passport-facebook/

---

## ❓ Need Help?

Check the logs:
```powershell
docker-compose logs -f api-service
```

Test the API directly:
```powershell
# Should redirect to Facebook login
Start-Process "http://localhost:3001/api/v1/social-auth/facebook"
```

Still stuck? Check:
1. Facebook App status (Development vs Live mode)
2. OAuth redirect URIs match exactly
3. Environment variables set correctly
4. Services restarted after config changes
