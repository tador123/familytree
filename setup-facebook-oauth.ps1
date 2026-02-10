# Quick Facebook OAuth Setup Script
# Run this after creating your Facebook App

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Facebook OAuth Quick Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📱 First, create your Facebook App:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://developers.facebook.com/" -ForegroundColor White
Write-Host "2. Click 'My Apps' → 'Create App'" -ForegroundColor White
Write-Host "3. Select 'Consumer' type" -ForegroundColor White
Write-Host "4. Name: 'Family Tree'" -ForegroundColor White
Write-Host "5. Add 'Facebook Login' product" -ForegroundColor White
Write-Host "6. Add OAuth Redirect URI:" -ForegroundColor White
Write-Host "   http://localhost:3001/api/v1/social-auth/facebook/callback" -ForegroundColor Gray
Write-Host ""

# Get credentials
$appId = Read-Host "Enter your Facebook App ID"
$appSecret = Read-Host "Enter your Facebook App Secret" -AsSecureString
$plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($appSecret)
)

# Generate session secret
$sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "`n✅ Credentials received!" -ForegroundColor Green
Write-Host "📝 Updating docker-compose.yml..." -ForegroundColor Yellow

# Read docker-compose.yml
$composeFile = "docker-compose.yml"
$content = Get-Content $composeFile -Raw

# Update/add environment variables
$content = $content -replace '#\s*FACEBOOK_APP_ID:.*', "FACEBOOK_APP_ID: $appId"
$content = $content -replace '#\s*FACEBOOK_APP_SECRET:.*', "FACEBOOK_APP_SECRET: $plainSecret"
$content = $content -replace '#\s*SESSION_SECRET:.*', "SESSION_SECRET: $sessionSecret"

# If not found, add them
if ($content -notmatch 'FACEBOOK_APP_ID:') {
    $content = $content -replace '(API_BASE_URL:)', "FACEBOOK_APP_ID: $appId`r`n      FACEBOOK_APP_SECRET: $plainSecret`r`n      SESSION_SECRET: $sessionSecret`r`n      `$1"
}

# Save file
Set-Content $composeFile $content

Write-Host "✅ docker-compose.yml updated!" -ForegroundColor Green
Write-Host "`n🔄 Restarting services..." -ForegroundColor Yellow

docker-compose restart api-service frontend

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ Facebook OAuth Configured!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "🧪 Test it now:" -ForegroundColor Cyan
Write-Host "1. Open: http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Click 'Continue with Facebook'" -ForegroundColor White
Write-Host "3. You'll be redirected to Facebook login" -ForegroundColor White
Write-Host "4. After authorizing, you'll be logged in!" -ForegroundColor White
Write-Host ""
Write-Host "✨ Instagram login uses the same Facebook App!" -ForegroundColor Yellow
Write-Host ""
