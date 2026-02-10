# Production Email Setup Guide

## 🎯 Quick Start - Gmail SMTP (Recommended for Immediate Use)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Windows Computer (or Other)
4. Click **Generate**
5. Copy the 16-character password (remove spaces)

### Step 3: Update docker-compose.yml
```yaml
api-service:
  environment:
    EMAIL_PROVIDER: gmail
    GMAIL_USER: your.email@gmail.com          # Your Gmail address
    GMAIL_APP_PASSWORD: abcdabcdabcdabcd      # 16-char app password (no spaces)
    FROM_NAME: Family Tree App
```

### Step 4: Restart Services
```powershell
docker-compose restart api-service
```

**Gmail Free Tier**: 500 emails/day ✅

---

## 🚀 Alternative - Resend (Best for Production)

### Why Resend?
- ✅ Professional email service
- ✅ 100 emails/day free (3,000/month)
- ✅ High deliverability
- ✅ Simple API
- ✅ No domain verification needed for testing

### Setup Steps

1. **Create Account**
   - Go to https://resend.com
   - Sign up (free)

2. **Get API Key**
   - Dashboard → API Keys → Create API Key
   - Copy the key (starts with `re_`)

3. **Update docker-compose.yml**
   ```yaml
   api-service:
     environment:
       EMAIL_PROVIDER: resend
       RESEND_API_KEY: re_xxxxxxxxxxxxxxxxxxxxx
       FROM_EMAIL: onboarding@resend.dev   # Default for testing
       FROM_NAME: Family Tree App
   ```

4. **Restart Services**
   ```powershell
   docker-compose restart api-service
   ```

5. **Optional: Add Custom Domain**
   - Resend Dashboard → Domains → Add Domain
   - Add DNS records to your domain
   - Update `FROM_EMAIL` to your domain

**Resend Free Tier**: 100 emails/day, 3,000/month ✅

---

## 📊 Provider Comparison

| Feature | Gmail SMTP | Resend | Console (Dev) |
|---------|-----------|--------|---------------|
| **Setup Time** | 5 minutes | 5 minutes | 0 (already works) |
| **Free Tier** | 500/day | 100/day, 3,000/month | Unlimited |
| **Deliverability** | Good | Excellent | N/A |
| **Domain Required** | No | No (can use theirs) | No |
| **Cost** | Always free | Free, then $20/mo | Free |
| **Best For** | Personal | Production | Development |

---

## 🔧 Current Status Check

Run this to see current email configuration:
```powershell
docker-compose exec api-service npm run dev
# Check startup logs for: "✅ Gmail SMTP initialized" or "✅ Email sent via Resend"
```

---

## 🧪 Testing

### Test Email Auth Flow
1. Open http://localhost:3000/login
2. Click **Email** tab
3. Enter your **real email address**
4. Click **Send Code**
5. Check your **real inbox** for OTP code
6. Enter code and login

### Check Logs
```powershell
docker-compose logs -f api-service
```

Look for:
- ✅ Gmail: `Email sent via Gmail to user@example.com (Message ID: ...)`
- ✅ Resend: `Email sent via Resend to user@example.com`
- ❌ Fallback: `Email logged to console (dev mode)` (means provider failed)

---

## 🛠️ Troubleshooting

### Gmail: "Invalid login" error
- **Solution**: Make sure 2FA is enabled AND you're using App Password (not your regular password)

### Gmail: "Less secure app" error
- **Solution**: Use App Password instead (see Step 2 above)

### Resend: "API key missing" error
- **Solution**: Check that `RESEND_API_KEY` starts with `re_` and has no extra spaces

### No emails received
1. Check spam/junk folder
2. Check Docker logs: `docker-compose logs api-service`
3. Ensure services restarted after config change

### Want to switch providers?
Just change `EMAIL_PROVIDER` in docker-compose.yml and restart:
```yaml
EMAIL_PROVIDER: gmail    # or 'resend' or 'console'
```

---

## 📝 Environment Variables Reference

```yaml
# Required for Gmail
EMAIL_PROVIDER: gmail
GMAIL_USER: your.email@gmail.com
GMAIL_APP_PASSWORD: abcdabcdabcdabcd

# Required for Resend
EMAIL_PROVIDER: resend
RESEND_API_KEY: re_xxxxxxxxxxxxxxxxxxxxx

# Optional (all providers)
FROM_NAME: Family Tree App          # Sender name
FROM_EMAIL: noreply@familytree.com  # Only for Resend with custom domain
API_BASE_URL: http://localhost:3001 # For magic links
FRONTEND_URL: http://localhost:3000 # For redirects
```

---

## ✅ Recommended Setup

**For Immediate Testing** → Use **Gmail SMTP** (5 min setup)

**For Production** → Use **Resend** (better deliverability, analytics)

**For Development** → Use **console** (already configured)

---

## 🎯 Next Steps

1. Choose provider (Gmail recommended for now)
2. Follow setup steps above
3. Update docker-compose.yml
4. Run: `docker-compose restart api-service`
5. Test login with your real email
6. Check your inbox! 📬
