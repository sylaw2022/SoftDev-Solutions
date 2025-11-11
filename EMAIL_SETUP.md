# Email Configuration Guide
# ========================

## Why Emails Aren't Being Received:
The system is currently using Ethereal Email for development testing, which captures emails instead of sending them to real recipients.

## To Send Real Emails:

### Option 1: Gmail SMTP (Recommended)
Create a `.env.local` file in your project root with:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@techflowsolutions.com
NODE_ENV=production
```

### Option 2: Other Email Providers
- **Outlook/Hotmail**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Use your hosting provider's SMTP settings

### Gmail Setup Steps:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an "App Password" for this application
3. Use the app password (not your regular password) in SMTP_PASS
4. Restart the service after adding the .env.local file

### Testing Real Emails:
1. Add your SMTP credentials to `.env.local`
2. Restart the service: `npm run dev`
3. Test the email button on the home page
4. Check your actual email inbox (not Ethereal preview)

### Current Status:
- ✅ Email system working correctly
- ✅ Templates and logic ready
- ❌ Using test service (Ethereal Email)
- 🔄 Need real SMTP credentials for actual delivery






