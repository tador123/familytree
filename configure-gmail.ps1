# Gmail SMTP Configuration Script
# This script helps you configure Gmail for production email delivery

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Gmail SMTP Setup for Family Tree" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📧 Follow these steps to enable Gmail:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Enable 2-Factor Authentication:" -ForegroundColor White
Write-Host "   https://myaccount.google.com/security" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Generate App Password:" -ForegroundColor White
Write-Host "   https://myaccount.google.com/apppasswords" -ForegroundColor Gray
Write-Host "   - Select 'Mail' and 'Windows Computer'" -ForegroundColor Gray
Write-Host "   - Click Generate" -ForegroundColor Gray
Write-Host "   - Copy the 16-character password (remove spaces)" -ForegroundColor Gray
Write-Host ""

# Get Gmail credentials
$gmailUser = Read-Host "Enter your Gmail address (e.g., yourname@gmail.com)"
$gmailAppPassword = Read-Host "Enter your 16-character App Password (no spaces)" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($gmailAppPassword)
)

Write-Host "`n✅ Configuration received!" -ForegroundColor Green
Write-Host "📝 Updating docker-compose.yml..." -ForegroundColor Yellow

# Read docker-compose.yml
$composeFile = "docker-compose.yml"
$content = Get-Content $composeFile -Raw

# Update environment variables
$content = $content -replace 'EMAIL_PROVIDER:\s*console', "EMAIL_PROVIDER: gmail"
$content = $content -replace '#\s*GMAIL_USER:.*', "GMAIL_USER: $gmailUser"
$content = $content -replace '#\s*GMAIL_APP_PASSWORD:.*', "GMAIL_APP_PASSWORD: $plainPassword"

# Uncomment Gmail settings if they're commented
if ($content -notmatch 'GMAIL_USER:') {
    $content = $content -replace '(EMAIL_PROVIDER: gmail)', "`$1`r`n      GMAIL_USER: $gmailUser`r`n      GMAIL_APP_PASSWORD: $plainPassword"
}

# Save updated file
Set-Content $composeFile $content

Write-Host "✅ docker-compose.yml updated!" -ForegroundColor Green
Write-Host "`n🔄 Restarting services..." -ForegroundColor Yellow

docker-compose restart api-service

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ Gmail SMTP Configured!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "🧪 Test your setup:" -ForegroundColor Cyan
Write-Host "1. Open: http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Click the 'Email' tab" -ForegroundColor White
Write-Host "3. Enter your email address ($gmailUser)" -ForegroundColor White
Write-Host "4. Click 'Send Code'" -ForegroundColor White
Write-Host "5. Check your Gmail inbox for the OTP code!" -ForegroundColor White
Write-Host ""
Write-Host "📊 Check logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f api-service" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Look for: 'Email sent via Gmail to $gmailUser'" -ForegroundColor Green
Write-Host ""
