# Jenkins Email Configuration for groklord2@gmail.com

## Quick Setup Instructions

### Step 1: Configure Jenkins SMTP Settings

1. **Open Jenkins Dashboard**
2. Go to **Manage Jenkins** → **System** (or **Configure System**)
3. Scroll to **Extended E-mail Notification** section
4. Configure the following:

```
SMTP server: smtp.gmail.com
SMTP Port: 587
Use SSL: ✓ (checked)
Use TLS: ✓ (checked)
Username: groklord2@gmail.com
Password: zqkycgwmjdvbytpi
```

5. Click **Advanced** and configure:
   - **Reply To List**: groklord2@gmail.com
   - **Charset**: UTF-8

6. Click **Test configuration** to verify it works
7. Click **Save**

### Step 2: Configure Default Email Notification

1. Still in **Manage Jenkins** → **System**
2. Scroll to **E-mail Notification** section
3. Configure:

```
SMTP server: smtp.gmail.com
Default user e-mail suffix: @gmail.com
Use SMTP Authentication: ✓
User Name: groklord2@gmail.com
Password: zqkycgwmjdvbytpi
Use SSL: ✓
SMTP Port: 587
```

4. Click **Test configuration by sending test e-mail**
5. Enter: `groklord2@gmail.com`
6. Click **Test**
7. Click **Save**

### Step 3: No Additional Plugin Required

The default Jenkins `mail` step is used, which is built-in and doesn't require any additional plugins.

## What the Jenkinsfile Does

The Jenkinsfile has been configured to send email notifications to `groklord2@gmail.com` for:

- ✅ **Success**: When all stages pass
- ❌ **Failure**: When any stage fails
- ⚠️ **Unstable**: When build completes but has warnings/failed tests

**Note**: Uses default Jenkins `mail` step (no plugin required)

## Email Content

Each email includes:
- Job name and build number
- Git branch and commit
- Build duration
- Status (Success/Failed/Unstable)
- Links to build details, console output, and test results
- Plain text format (default Jenkins mail step)

## Testing

After configuration:
1. Run a Jenkins build
2. Check `groklord2@gmail.com` inbox
3. You should receive emails for:
   - Build success
   - Build failure
   - Build unstable

## Troubleshooting

### No emails received

1. **Check spam folder**: Gmail may filter Jenkins emails
2. **Verify SMTP settings**: Test configuration button should work
3. **Check Jenkins logs**: Go to **Manage Jenkins** → **System Log**
4. **Verify plugin installed**: Check **Manage Jenkins** → **Plugins**

### Authentication failed

- Verify the app password is correct: `zqkycgwmjdvbytpi`
- Make sure 2-Step Verification is enabled on Gmail
- Try regenerating the app password if needed

### Plugin not found error

- The default `mail` step is built-in and doesn't require any plugins
- If you see errors, check that SMTP is configured correctly in system settings

## Security Note

⚠️ **Important**: The app password `zqkycgwmjdvbytpi` is configured in Jenkins system settings, not in the Jenkinsfile. This is the secure way to handle credentials.

If you need to change the password:
1. Generate a new app password from Google Account
2. Update it in Jenkins system configuration
3. Test the configuration

## Email Notification Triggers

The pipeline sends emails:
- **Always**: After pipeline completes (any status)
- **Success**: When all stages pass successfully
- **Failure**: When any stage fails
- **Unstable**: When build completes but has issues

All emails are sent to: **groklord2@gmail.com**

