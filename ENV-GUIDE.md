# 🔑 Environment Variables - Complete Guide

## 📋 All Environment Variables You Need

### **File 1: `backend/.env`**

```bash
# ✅ REQUIRED - Fill these in:

DATABASE_URL=postgresql://postgres:password@localhost:5432/perfect_match

JWT_SECRET=generate-random-secret-here

GOOGLE_CLIENT_ID=paste-from-google-cloud-console

GOOGLE_CLIENT_SECRET=paste-from-google-cloud-console

# ✅ OPTIONAL - Can leave defaults
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=auto-generate-or-set-random
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### **File 2: `frontend/.env.local`**

```bash
# ✅ REQUIRED - Fill these in:

NEXT_PUBLIC_API_URL=http://localhost:3001

GOOGLE_CLIENT_ID=paste-from-google-cloud-console

GOOGLE_CLIENT_SECRET=paste-from-google-cloud-console

# ✅ OPTIONAL - Already set
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=auto-generate
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MATCH_RELEASE_DATE=2026-02-05T00:00:00Z
```

---

## 🔗 Links to Get All Environment Variables

### **1. JWT_SECRET (Generate Random)**

👉 **Go to:** https://www.uuidgenerator.net/api/version4

OR generate in terminal:
```bash
openssl rand -base64 32
```

**Copy the generated string and paste it as your JWT_SECRET**

---

### **2. Google OAuth (Client ID & Secret)**

👉 **Step 1:** Go to: https://console.cloud.google.com

👉 **Step 2:** Sign in with your Google account (FREE - no billing required)

👉 **Step 3:** Create a new project
- Click "Select a project" dropdown (top left)
- Click "New Project"
- Project name: `mapua-mcl-perfect-match`
- Click "Create"

👉 **Step 4:** Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click on it and press "Enable"

👉 **Step 5:** Configure OAuth consent screen
- Go to "APIs & Services" → "OAuth consent screen"
- Select "External" → Click "Create"
- Fill in:
  - App name: `Mapúa MCL Perfect Match`
  - User support email: `your-email@gmail.com`
  - Developer contact: `your-email@gmail.com`
- Click "Save and Continue" (skip other sections)
- Click "Back to Dashboard"

👉 **Step 6:** Create OAuth 2.0 Client ID
- Go to "APIs & Services" → "Credentials"
- Click "+ Create Credentials" → "OAuth 2.0 Client ID"
- Application type: **Web application**
- Name: `Mapúa MCL Perfect Match - Web`

👉 **Step 7:** Add Authorized redirect URIs
- Click "Add URI" under "Authorized redirect URIs"
- Add: `http://localhost:3001/api/auth/google/callback`
- Click "Add URI" again
- Add: `http://localhost:3000/api/auth/google/callback`

👉 **Step 8:** Create credentials
- Click "Create"
- **Copy your Client ID** (looks like: `123456789-abcde....apps.googleusercontent.com`)
- **Copy your Client Secret** (looks like: `GOCSPX-xxxxxx`)

---

### **3. NEXTAUTH_SECRET (Generate Random)**

👉 **Go to:** https://www.uuidgenerator.net/api/version4

OR generate in terminal:
```bash
openssl rand -base64 32
```

**Use the same as JWT_SECRET or generate a new one**

---

### **4. Email (Optional - For notifications)**

👉 **Option A: Use Gmail (FREE)**
- Go to: https://myaccount.google.com
- Enable 2-Step Verification
- Go to: https://myaccount.google.com/apppasswords
- Generate app password
- Use as `EMAIL_PASSWORD`

👉 **Option B: Skip for now**
- You can add email later
- The app will work without email notifications

---

## 📝 Quick Copy-Paste Template

### **Generate All Secrets:**

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### **Your Google OAuth credentials will look like:**

```
Client ID:     123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Checklist

- [ ] Install PostgreSQL (instructions below)
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 Client ID
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Generate JWT_SECRET
- [ ] Generate NEXTAUTH_SECRET
- [ ] Fill in backend/.env
- [ ] Fill in frontend/.env.local
- [ ] Run setup script

---

## 🔗 All Links Summary

| Purpose | Link |
|---------|------|
| **Google Cloud Console** | https://console.cloud.google.com |
| **Create New Project** | https://console.cloud.google.com/projectcreate |
| **APIs Library** | https://console.cloud.google.com/apis/library |
| **OAuth Consent Screen** | https://console.cloud.google.com/apis/credentials/consent |
| **Create Credentials** | https://console.cloud.google.com/apis/credentials |
| **Generate UUID** | https://www.uuidgenerator.net/api/version4 |
| **PostgreSQL Download** | https://www.postgresql.org/download/macosx/ |
| **Docker (Alternative)** | https://docs.docker.com/desktop/install/mac-install/ |

---

## 💡 Tips

1. **Save your Google credentials** - You'll need them again
2. **Keep secrets safe** - Don't commit .env files to Git
3. **Use strong passwords** - Generate random secrets
4. **Test locally first** - Deploy to production after testing

---

## 🆘 Need Help?

- **Google Cloud Setup:** https://cloud.google.com/docs
- **OAuth Setup:** https://developers.google.com/identity/protocols/oauth2
- **PostgreSQL Setup:** https://www.postgresql.org/docs/

---

**File Location:** `/Users/hoon/Desktop/wizardmatch/ENV-GUIDE.md`
