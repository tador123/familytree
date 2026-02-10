# 🚀 Quick Setup: Receive Real Emails to Gmail

## Option 1: Automated Setup (Recommended)

Run this script and follow the prompts:
```powershell
.\configure-gmail.ps1
```

---

## Option 2: Manual Setup (5 minutes)

### Step 1: Generate Gmail App Password

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" → Enable it

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select App: **Mail**
   - Select Device: **Windows Computer** (or Other)
   - Click **Generate**
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces → `abcdefghijklmnop`

### Step 2: Update docker-compose.yml

Open `docker-compose.yml` and find the `api-service` section:

**Change these lines:**
```yaml
api-service:
  environment:
    EMAIL_PROVIDER: gmail  # Change from 'console' to 'gmail'
    GMAIL_USER: your.email@gmail.com          # Add your Gmail
    GMAIL_APP_PASSWORD: abcdefghijklmnop      # Add your 16-char password
```

**Full example:**
```yaml
api-service:
  environment:
    NODE_ENV: development
    PORT: 3001
    DATABASE_URL: postgresql://familytree:familytree_password@postgres:5432/familytree
    MEDIA_SERVICE_URL: http://media-service:3002
    SMS_PROVIDER: textbelt
    TEXTBELT_API_KEY: textbelt
    EMAIL_PROVIDER: gmail
    GMAIL_USER: john.doe@gmail.com
    GMAIL_APP_PASSWORD: abcdefghijklmnop
    FROM_NAME: Family Tree App
    API_BASE_URL: http://localhost:3001
    FRONTEND_URL: http://localhost:3000
```

### Step 3: Restart Services

```powershell
docker-compose restart api-service
```

Wait 5-10 seconds for the service to restart.

---

## 🧪 Test It!

1. Open: http://localhost:3000/login
2. Click **"Email"** tab
3. Enter your Gmail address
4. Click **"Send Code"**
5. **Check your Gmail inbox!** 📬

You should receive an email with:
- Subject: "🔐 Your verification code: 123456"
- Beautiful HTML email with your 6-digit code
- Arrives in **under 5 seconds**

---

## 📊 Verify It's Working

Check Docker logs:
```powershell
docker-compose logs -f api-service
```

**Look for this line:**
```
✅ Gmail SMTP initialized for your.email@gmail.com
✅ Email sent via Gmail to your.email@gmail.com (Message ID: ...)
```

**If you see this, IT'S NOT WORKING:**
```
📧 EMAIL SERVICE - DEVELOPMENT MODE  # Still in console mode
```

---

## 🔧 Troubleshooting

### Problem: "Invalid login"
- **Cause**: Using regular password instead of App Password
- **Fix**: Make sure you generated an App Password (Step 1 above)

### Problem: "Less secure apps"
- **Cause**: Old Gmail setting
- **Fix**: Use App Password (modern method)

### Problem: Still seeing console logs
- **Cause**: docker-compose.yml not saved or service not restarted
- **Fix**: 
  1. Save docker-compose.yml (Ctrl+S)
  2. Run: `docker-compose restart api-service`
  3. Wait 10 seconds
  4. Try again

### Problem: No email received
1. Check **Spam/Junk** folder
2. Check logs: `docker-compose logs api-service`
3. Make sure you see "✅ Email sent via Gmail"
4. Try a different email address

---

## ✅ What You Get

- ✉️ **Real emails** to your Gmail inbox
- 🚀 **Instant delivery** (under 5 seconds)
- 🎨 **Beautiful HTML emails** with gradient buttons
- 🔒 **Secure** (App Password, not your real password)
- 💰 **Free** (Gmail allows 500 emails/day)
- 📱 **Production-ready** (perfect for real users)

---

## 🎯 Next: Try Magic Link Login

Magic links are even easier:

1. Go to login page
2. Click **"Email"** tab
3. Click **"Magic Link"** sub-tab
4. Enter your email
5. Click **"Send Magic Link"**
6. Check your Gmail
7. Click the button in the email
8. **Instant login!** ✨

No code to type, just click and you're in!

---

## 💡 Production Tips

### For Personal Use (Current Setup)
- ✅ Gmail is perfect
- ✅ Free 500 emails/day
- ✅ No domain needed
- ✅ 5-minute setup

### For Business/Many Users
Consider upgrading to **Resend**:
- 3,000 emails/month free
- Better deliverability
- Analytics dashboard
- Custom domain support
- See: `PRODUCTION_EMAIL_SETUP.md`

---

## 🎉 You're Done!

Your family tree app now:
- ✅ Sends real emails
- ✅ Verifies real users
- ✅ Works in production
- ✅ Costs $0

**Enjoy your production-ready authentication!** 🚀
