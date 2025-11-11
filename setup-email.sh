#!/bin/bash

# Email Configuration Setup Script
# This script helps you configure real email sending

echo "📧 Email Configuration Setup"
echo "============================"
echo ""
echo "This script will help you configure real email sending instead of test emails."
echo ""

# Function to create .env.local with user input
setup_email_config() {
    echo "Please provide your email configuration:"
    echo ""
    
    read -p "SMTP Host (default: smtp.gmail.com): " smtp_host
    smtp_host=${smtp_host:-smtp.gmail.com}
    
    read -p "SMTP Port (default: 587): " smtp_port
    smtp_port=${smtp_port:-587}
    
    read -p "SMTP User (your email): " smtp_user
    
    read -s -p "SMTP Password (your app password): " smtp_pass
    echo ""
    
    read -p "From Email (default: same as SMTP User): " smtp_from
    smtp_from=${smtp_from:-$smtp_user}
    
    read -p "Admin Email for notifications: " admin_email
    
    # Create .env.local file
    cat > .env.local << EOF
# Real Email Configuration
SMTP_HOST=$smtp_host
SMTP_PORT=$smtp_port
SMTP_SECURE=false
SMTP_USER=$smtp_user
SMTP_PASS=$smtp_pass
SMTP_FROM=$smtp_from
ADMIN_EMAIL=$admin_email
NODE_ENV=production
EOF

    echo ""
    echo "✅ Configuration saved to .env.local"
    echo ""
    echo "📋 Gmail Setup Instructions:"
    echo "1. Enable 2-Factor Authentication on your Gmail account"
    echo "2. Go to Google Account Settings > Security > App passwords"
    echo "3. Generate an 'App password' for this application"
    echo "4. Use the app password (not your regular password) in SMTP_PASS"
    echo ""
    echo "🔄 Next steps:"
    echo "1. Restart the service: npm run dev"
    echo "2. Test the email button on the home page"
    echo "3. Check your actual email inbox"
}

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ $overwrite =~ ^[Yy]$ ]]; then
        setup_email_config
    else
        echo "Configuration not changed."
    fi
else
    setup_email_config
fi

echo ""
echo "🎉 Setup complete! Restart your service to apply the new configuration."






