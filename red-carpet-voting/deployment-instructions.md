# 🌟 Red Carpet Voting App - Deployment Instructions

## Quick Deploy to Vercel (5 Minutes)

### Step 1: Download All Files

Download these 6 artifacts and organize them in this folder structure:

```
red-carpet-voting/
├── package.json
├── next.config.js
├── .gitignore
├── app/
│   ├── layout.js
│   ├── page.js
│   └── api/
│       └── votes/
│           └── route.js
```

### Step 2: Create a GitHub Repository

1. Go to https://github.com and create a new repository
2. Name it: `red-carpet-voting`
3. Make it Public or Private
4. Don't initialize with README

### Step 3: Upload Files to GitHub

**Option A: Using GitHub Web Interface**
1. Click "uploading an existing file"
2. Drag all your folders/files
3. Click "Commit changes"

**Option B: Using Git (if you have it installed)**
```bash
cd red-carpet-voting
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/red-carpet-voting.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import" next to your GitHub repository
4. Vercel will auto-detect it's a Next.js app
5. Click "Deploy"
6. Wait 2-3 minutes... Done! 🎉

### Step 5: Get Your URL

- Your app will be live at: `https://red-carpet-voting.vercel.app` (or similar)
- Click to test it!

### Step 6: Create QR Code

1. Copy your Vercel URL
2. Go to https://www.qr-code-generator.com/
3. Paste URL and generate
4. Download and display at your party!

---

## ✨ Features

- ✅ **Real-time vote synchronization** across all 70 devices
- ✅ **Beautiful Red Carpet theme** with animations
- ✅ **API backend** for reliable data storage
- ✅ **Responsive design** works on phones, tablets, and laptops
- ✅ **Spin wheel** for winner selection
- ✅ **Vote tracking** with real-time counter
- ✅ **Reset functionality** for host

---

## 🎉 Party Day Checklist

1. ☐ Display QR code prominently at entrance
2. ☐ Test the URL on your phone
3. ☐ Have the results page ready to display (open it on a laptop/tablet)
4. ☐ Keep the URL handy for guests who can't scan QR codes

---

## 💡 Pro Tips

- **For displaying results**: Open the results page on a TV/projector
- **Auto-refresh**: Results update every 3 seconds automatically
- **Multiple devices**: Everyone can vote simultaneously
- **Privacy**: Votes are stored temporarily in memory (perfect for a one-night event)

---

## 🆘 Need Help?

If you encounter any issues, just let me know and I'll help troubleshoot!