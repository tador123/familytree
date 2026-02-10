# SMS Configuration Guide

## Overview
The authentication system supports multiple SMS providers for sending OTP codes. The system automatically falls back to console logging if the SMS provider fails.

## Environment Variables

Add these to your `.env` file in `services/api-service/`:

```bash
# SMS Provider Configuration
# Options: 'console' (default), 'textbelt'
SMS_PROVIDER=console

# TextBelt API Key (optional)
# Use 'textbelt' for free tier (1 SMS per day)
# Get a paid key from https://textbelt.com/purchase/ for unlimited SMS
TEXTBELT_API_KEY=textbelt
```

## Available Providers

### 1. Console (Development - Default)
```bash
SMS_PROVIDER=console
```
- **Best for**: Local development and testing
- **Cost**: Free
- **Features**: Logs OTP to console with formatted output
- No additional setup required

### 2. TextBelt (Production - Free Tier)
```bash
SMS_PROVIDER=textbelt
TEXTBELT_API_KEY=textbelt
```
- **Best for**: Testing with real SMS, low-volume apps
- **Cost**: 1 free SMS per day, then paid
- **Features**: 
  - Real SMS delivery
  - Works worldwide
  - Automatic fallback to console if quota exceeded
- **Website**: https://textbelt.com/
- **Upgrade**: Get API key at https://textbelt.com/purchase/

### 3. Adding More Providers

You can easily extend the `smsService.ts` to support:
- **Twilio**: Popular, reliable, $0.0075 per SMS
- **AWS SNS**: Scalable, $0.00645 per SMS
- **Vonage (Nexmo)**: Global coverage
- **MSG91**: Good for Indian numbers
- **Fast2SMS**: Free tier for Indian numbers

## Testing

### Test OTP Sending
```powershell
# PowerShell
$body = @{phoneNumber='5551234567'; countryCode='+1'} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/v1/auth/send-otp `
  -Method POST -Body $body -ContentType 'application/json'
```

### Check OTP in Console
```powershell
docker logs familytree-api --tail=20
```

### With TextBelt
1. Set `SMS_PROVIDER=textbelt` in `.env`
2. Restart API service: `docker-compose restart api-service`
3. Send OTP - you'll receive real SMS
4. Check quota: Look for "Quota remaining" in logs

## OTP Details

- **Code Length**: 6 digits
- **Valid Duration**: 10 minutes
- **Rate Limiting**: 1 OTP per phone number per minute
- **Security**: Codes are hashed and stored securely
- **Expiry**: Old codes automatically expire

## Troubleshooting

### OTP not appearing in console
```bash
# Check if service is running
docker ps

# View logs
docker logs familytree-api --tail=50

# Restart service
docker-compose restart api-service
```

### TextBelt quota exceeded
The system automatically falls back to console logging. Check logs for:
```
❌ TextBelt error: Out of quota
📱 SMS SERVICE - DEVELOPMENT MODE
```

### SMS not received (TextBelt)
- Check phone number format: Include country code without '+' for some providers
- Verify internet connectivity in Docker container
- Check TextBelt status: https://textbelt.com/
- Review API response in logs

## Production Recommendations

For production use:
1. **Use a paid SMS provider** (Twilio, AWS SNS, or TextBelt paid plan)
2. **Set up proper monitoring** for SMS delivery failures
3. **Implement retry logic** with exponential backoff
4. **Add SMS templates** for branding
5. **Monitor costs** - set up billing alerts
6. **Use rate limiting** to prevent abuse
7. **Consider alternative auth** methods (Email, WhatsApp)

## Cost Comparison

| Provider | Free Tier | Paid Cost (per SMS) | Best For |
|----------|-----------|---------------------|----------|
| Console | ∞ | N/A | Development |
| TextBelt | 1/day | $0.015 | Testing |
| Twilio | $15 credit | $0.0075 | Production |
| AWS SNS | 100 (first year) | $0.00645 | High volume |
| MSG91 | Limited | $0.003 | India |

## Next Steps

1. **For Development**: Keep `SMS_PROVIDER=console` (current setup ✅)
2. **For Testing**: Use `SMS_PROVIDER=textbelt` with free quota
3. **For Production**: Integrate Twilio or AWS SNS (see `smsService.ts` for extension points)
