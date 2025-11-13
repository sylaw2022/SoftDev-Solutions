# Exposing Your Project to the Internet with ngrok

This guide explains how to expose your Next.js application to the internet using ngrok, allowing you to:
- Share your local development server with others
- Test webhooks and external integrations
- Access your app from mobile devices on the same network
- Demo your application remotely

## Prerequisites

- ngrok is already installed at `/home/sylaw/bin/ngrok`
- Next.js development server running on port 3000 (default)

## Quick Start

### Method 1: Using the Helper Script (Recommended)

1. **Start your Next.js development server** (in one terminal):
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`

2. **Start ngrok tunnel** (in another terminal):
   ```bash
   ./start-ngrok.sh
   ```
   Or specify a custom port:
   ```bash
   ./start-ngrok.sh 3000
   ```

3. **Copy the public URL** from ngrok output:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```
   Your app is now accessible at `https://abc123.ngrok.io`

### Method 2: Direct ngrok Command

```bash
ngrok http 3000
```

### Method 3: Using npm Script (Alternative)

You can also add this to your `package.json` scripts:
```json
"ngrok": "ngrok http 3000"
```

Then run:
```bash
npm run ngrok
```

## ngrok Features

### Free Plan Features
- Random subdomain on each restart
- HTTPS support
- Basic request inspection
- Limited connections per minute

### Paid Plan Features (if you have one)
- Custom domain
- Reserved subdomain
- More connections
- Advanced features

## Accessing ngrok Web Interface

While ngrok is running, you can access the web interface at:
```
http://localhost:4040
```

This shows:
- Request/response details
- Replay requests
- Inspect headers and payloads
- View request history

## Configuration (Optional)

### Create ngrok Config File

Create `~/.ngrok2/ngrok.yml` (or `~/.config/ngrok/ngrok.yml` for newer versions):

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN  # Get from https://dashboard.ngrok.com/get-started/your-authtoken

tunnels:
  nextjs-dev:
    proto: http
    addr: 3000
    inspect: true
```

Then start with:
```bash
ngrok start nextjs-dev
```

### Get Your Auth Token

1. Sign up at https://dashboard.ngrok.com (free)
2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure it:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Common Use Cases

### 1. Testing Webhooks
If you need to receive webhooks from external services:
```bash
ngrok http 3000
```
Then use the ngrok URL as your webhook endpoint.

### 2. Mobile Testing
Access your local dev server from mobile devices:
- Start ngrok tunnel
- Use the ngrok HTTPS URL on your mobile device
- Ensure your app handles CORS if needed

### 3. Sharing with Team
Share the ngrok URL with team members for quick demos or testing.

## Security Considerations

⚠️ **Important Security Notes:**

1. **Development Only**: Only use ngrok for development/testing. Never expose production servers this way.

2. **Temporary URLs**: Free ngrok URLs change on each restart. Don't hardcode them.

3. **Public Access**: Anyone with the ngrok URL can access your app. Be careful with:
   - Admin panels
   - Sensitive data
   - Authentication systems

4. **Rate Limiting**: Free ngrok has connection limits. Consider upgrading for production use.

5. **HTTPS**: ngrok provides HTTPS automatically, which is great for testing.

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9
```

### ngrok Not Found
```bash
# Add ngrok to PATH (if needed)
export PATH=$PATH:/home/sylaw/bin

# Or create a symlink
sudo ln -s /home/sylaw/bin/ngrok /usr/local/bin/ngrok
```

### Connection Refused
- Ensure your Next.js server is running before starting ngrok
- Check that the port matches (default: 3000)
- Verify firewall settings

### ngrok Session Expired
- Free ngrok sessions expire after 2 hours
- Restart ngrok to get a new session
- Consider upgrading for longer sessions

## Stopping ngrok

Press `Ctrl+C` in the terminal where ngrok is running, or:
```bash
pkill ngrok
```

## Next Steps

1. Start your Next.js dev server: `npm run dev`
2. Start ngrok: `./start-ngrok.sh`
3. Share the ngrok URL with others or use it for testing
4. Access the web interface at `http://localhost:4040` for debugging

## Additional Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [ngrok Dashboard](https://dashboard.ngrok.com)
- [ngrok Getting Started](https://ngrok.com/docs/getting-started)

