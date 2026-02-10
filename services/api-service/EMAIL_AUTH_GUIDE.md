# Email Authentication System

## Overview
A modern, passwordless authentication system using **Email Magic Links** (recommended) and **Email OTP codes** (alternative). Free, secure, and can verify real users.

## Why Email Authentication?

✅ **100% Free** - No SMS costs, works with free email providers  
✅ **Real User Verification** - Valid email = real person  
✅ **No Password Management** - More secure, better UX  
✅ **Mobile Friendly** - Works on any device  
✅ **Easy to Upgrade** - Can add paid SMS later if needed

## Two Methods Available

### 1. Magic Links (Recommended ⭐)
User clicks a link sent to their email - instant login, no code to type.

**Pros:**
- Fastest user experience
- No code memorization
- Most modern approach
- One-click login

**Cons:**
- Requires email client access during login
- Some users may not trust clicking links

### 2. Email OTP (Alternative)
User receives a 6-digit code via email and enters it.

**Pros:**
- Familiar UX (like SMS OTP)
- No link clicking required
- Can copy-paste code
- Works even if email is on another device

**Cons:**
- Extra step (enter code)
- Slightly slower than magic link

---

## API Endpoints

Base URL: `http://localhost:3001/api/v1/email-auth`

### Send Magic Link
```http
POST /send-magic-link
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"  // optional
}

Response:
{
  "success": true,
  "message": "Magic link sent to user@example.com",
  "expiresIn": 900  // 15 minutes
}
```

### Verify Magic Link
```http
GET /verify-magic-link?token=xxx

Automatically redirects to:
- Success: http://localhost:3000/auth/callback?token=session_token
- Error: http://localhost:3000/auth/error?message=error_message
```

### Send Email OTP
```http
POST /send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Jane Smith"  // optional
}

Response:
{
  "success": true,
  "message": "Verification code sent to user@example.com",
  "expiresIn": 600  // 10 minutes
}
```

### Verify OTP
```http
POST /verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "session_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Smith"
  }
}
```

### Verify Session
```http
GET /verify-session
Authorization: Bearer session_token

Response:
{
  "success": true,
  "message": "Session valid",
  "user": { ... }
}
```

### Get Current User
```http
GET /me
Authorization: Bearer session_token

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Logout
```http
POST /logout
Authorization: Bearer session_token

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Email Providers

### Development (Current - Free ✅)
Console logging - OTP codes and magic links appear in Docker logs.

```bash
# Check logs for codes/links
docker logs familytree-api --tail=50 | grep "OTP Code"
docker logs familytree-api --tail=50 | grep "Magic Link"
```

### Production - Resend (Recommended)
**Free Tier:** 100 emails/day, 3,000/month  
**Cost:** $20/month for 50,000 emails after free tier  
**Setup:** https://resend.com/

1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com  # Must be verified domain
FROM_NAME=Family Tree App
```

4. Restart API:
```bash
docker-compose restart api-service
```

### Other Options
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free for 3 months
- **AWS SES** - 62,000 emails/month free (first year)
- **Gmail SMTP** - Free, but limited (500/day)

---

## Security Features

✅ **Rate Limiting** - 1 request per minute per email  
✅ **Time Expiry** - Magic links (15 min), OTP (10 min)  
✅ **One-Time Use** - Codes/links can't be reused  
✅ **Attempt Tracking** - Max 3 failed OTP attempts  
✅ **Session Management** - 7-day sessions with tokens  
✅ **Email Validation** - Proper format checking

---

## Testing

### PowerShell Commands

**Send Magic Link:**
```powershell
$body = @{email='user@example.com'; name='John Doe'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/v1/email-auth/send-magic-link `
  -Method POST -Body $body -ContentType 'application/json'
```

**Send OTP:**
```powershell
$body = @{email='test@example.com'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/v1/email-auth/send-otp `
  -Method POST -Body $body -ContentType 'application/json'
```

**Check Logs:**
```powershell
docker logs familytree-api --tail=30
```

**Verify OTP:**
```powershell
$body = @{email='test@example.com'; code='123456'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/v1/email-auth/verify-otp `
  -Method POST -Body $body -ContentType 'application/json'
```

---

## Database Schema

```prisma
model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  phoneNumber   String?   @unique  // Optional, for future SMS upgrade
  name          String?
  isVerified    Boolean   @default(false)
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  magicLinks    MagicLink[]
  otpCodes      OtpCode[]
  sessions      Session[]
}

model MagicLink {
  id          String   @id @default(uuid())
  userId      String?
  email       String
  token       String   @unique  // 64-char hex
  expiresAt   DateTime
  isUsed      Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model OtpCode {
  id          String   @id @default(uuid())
  userId      String?
  email       String?
  phoneNumber String?  // For future SMS
  code        String   // 6-digit
  expiresAt   DateTime
  isUsed      Boolean  @default(false)
  attempts    Int      @default(0)
  createdAt   DateTime @default(now())
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique  // 64-char hex
  expiresAt DateTime  // 7 days
  createdAt DateTime @default(now())
}
```

---

## Upgrade Path to Paid SMS

When ready to add SMS:

1. Keep email auth as primary
2. Add SMS as premium feature
3. Update `.env`:
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

4. Existing phone auth endpoints already support it!
5. Users can choose: Email (free) or SMS (premium)

---

## Production Checklist

✅ Configure real email provider (Resend recommended)  
✅ Set up custom domain for emails  
✅ Configure FRONTEND_URL environment variable  
✅ Enable HTTPS for API  
✅ Set up email delivery monitoring  
✅ Configure rate limiting (currently 1/min)  
✅ Set up logging/analytics  
✅ Test email deliverability  
✅ Create terms of service link in emails  
✅ Add email unsubscribe option (if sending marketing)

---

## Troubleshooting

### Email not appearing in logs
```bash
docker logs familytree-api --tail=50
docker ps  # Check if API is running
docker-compose restart api-service
```

### Magic link broken
- Check `API_BASE_URL` environment variable
- Ensure frontend callback route exists
- Verify token hasn't expired (15 min)

### OTP verification fails
- Check if code is correct (case-sensitive)
- Verify code hasn't expired (10 min)
- Ensure code hasn't been used already
- Check attempt limit (max 3 attempts)

### Resend not working
- Verify API key is correct
- Check domain is verified in Resend dashboard
- Review Resend logs at https://resend.com/logs
- Ensure FROM_EMAIL uses verified domain

---

## Cost Comparison

| Provider | Free Tier | Paid Start | Best For |
|----------|-----------|------------|----------|
| Console | ∞ | N/A | Development |
| Resend | 3,000/mo | $20/mo | Small-Medium apps |
| SendGrid | 100/day | $20/mo | Enterprise |
| AWS SES | 62,000/mo* | $0.10/1000 | High volume |
| Mailgun | Trial only | $35/mo | EU focus |

*First year only

---

## Support

- Magic links not working? Check frontend callback route
- OTP not received? Check logs with `docker logs familytree-api`
- Need help? Review logs and check network connectivity
