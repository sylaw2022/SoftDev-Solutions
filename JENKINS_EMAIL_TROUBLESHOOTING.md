# Jenkins Email Notification Troubleshooting

## Issue: Test Email Works But Pipeline Emails Not Received

If the test email works but you're not receiving emails after pipeline runs, try these solutions:

### Solution 1: Check Console Output

1. Go to your Jenkins build
2. Click on **Console Output**
3. Look for messages like:
   - "Sending success email notification..."
   - "Success email notification sent"
   - "Email notification failed: ..."

### Solution 2: Verify Mail Step Execution

The `mail` step should be called directly in the `post` block, not wrapped in unnecessary `script` blocks. The current Jenkinsfile has been updated to:

- Remove `script` wrapper around `mail` step
- Add echo statements to track email sending
- Remove try-catch that might be hiding errors

### Solution 3: Check Email Configuration

Even though test email works, verify:

1. **E-mail Notification** section in **Manage Jenkins** → **System**:
   - SMTP server: `smtp.gmail.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Use SMTP Authentication: ✓
   - User Name: `groklord2@gmail.com`
   - Password: `zqkycgwmjdvbytpi`
   - Use SSL: ✓

2. **Default user e-mail suffix**: `@gmail.com`

### Solution 4: Check Spam Folder

- Gmail may filter Jenkins emails to spam
- Mark as "Not Spam" if found
- Add Jenkins email to contacts

### Solution 5: Verify Mail Step Syntax

The `mail` step should be called directly:

```groovy
post {
    success {
        mail (
            to: "groklord2@gmail.com",
            subject: "Build Success",
            body: "Build succeeded"
        )
    }
}
```

**NOT** wrapped in `script` block unnecessarily.

### Solution 6: Enable Debug Logging

Add to Jenkinsfile to see what's happening:

```groovy
post {
    success {
        echo "About to send email to groklord2@gmail.com"
        echo "Build URL: ${env.BUILD_URL}"
        mail (
            to: "groklord2@gmail.com",
            subject: "✅ Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Test email"
        )
        echo "Email sent"
    }
}
```

### Solution 7: Check Jenkins Logs

1. Go to **Manage Jenkins** → **System Log**
2. Look for email-related errors
3. Check for authentication failures or connection issues

### Solution 8: Verify Environment Variables

The mail step uses environment variables. Check if they're set:

```groovy
post {
    success {
        echo "JOB_NAME: ${env.JOB_NAME}"
        echo "BUILD_NUMBER: ${env.BUILD_NUMBER}"
        echo "BUILD_URL: ${env.BUILD_URL}"
        // Then send email
    }
}
```

### Solution 9: Use Explicit Recipients List

Try using a list format:

```groovy
mail (
    to: "groklord2@gmail.com",
    cc: "",
    bcc: "",
    subject: "Build Success",
    body: "Build succeeded"
)
```

### Solution 10: Check Mailer Plugin

1. Go to **Manage Jenkins** → **Plugins**
2. Search for "Mailer"
3. Ensure it's installed and enabled
4. Restart Jenkins if needed

### Common Issues

#### Issue: "No such DSL method 'mail'"

**Solution**: Install Mailer Plugin
- Go to **Manage Jenkins** → **Plugins**
- Install "Mailer Plugin"
- Restart Jenkins

#### Issue: "Authentication failed"

**Solution**: 
- Verify app password is correct
- Check SMTP settings match test email configuration
- Ensure 2-Step Verification is enabled on Gmail

#### Issue: Emails go to spam

**Solution**:
- Add Jenkins email to Gmail contacts
- Mark as "Not Spam"
- Check Gmail filters

#### Issue: Test email works but pipeline email doesn't

**Possible causes**:
1. Mail step not executing (check console output)
2. Environment variables not set (check echo statements)
3. Mail step wrapped incorrectly (should be direct, not in script block)
4. Silent failure (check Jenkins logs)

### Debugging Steps

1. **Check Console Output**:
   ```
   Look for: "Sending success email notification..."
   Look for: "Success email notification sent"
   ```

2. **Check for Errors**:
   ```
   Look for: "Email notification failed"
   Look for: Any exception messages
   ```

3. **Verify SMTP Settings**:
   - Test email should work (you confirmed this)
   - Settings should match in both "E-mail Notification" and test

4. **Check Environment Variables**:
   - `env.JOB_NAME` should be set
   - `env.BUILD_NUMBER` should be set
   - `env.BUILD_URL` should be set

5. **Try Simple Test**:
   ```groovy
   post {
       success {
           mail (
               to: "groklord2@gmail.com",
               subject: "Test",
               body: "Test email from Jenkins"
           )
       }
   }
   ```

### Updated Jenkinsfile Features

The current Jenkinsfile:
- ✅ Uses `mail` step directly (not wrapped in script)
- ✅ Includes echo statements for debugging
- ✅ Removed try-catch that might hide errors
- ✅ Uses proper syntax for default mail step

### Next Steps

1. Run a build and check console output
2. Look for "Sending... email notification" messages
3. Check if "email notification sent" appears
4. If errors appear, check Jenkins system logs
5. Verify SMTP settings match test email configuration

If emails still don't arrive after these steps, check:
- Jenkins system logs for email errors
- Gmail spam folder
- Email filters in Gmail
- Jenkins plugin status (Mailer plugin)

