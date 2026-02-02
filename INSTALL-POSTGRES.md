# 🐘 PostgreSQL Installation Guide for macOS

## **Option 1: Postgres.app (Easiest - Recommended for macOS)**

### 👉 Download Link: https://postgresapp.com/

**Steps:**
1. Go to: https://postgresapp.com/downloads.html
2. Download "Postgres.app" (FREE)
3. Open the downloaded .dmg file
4. Drag Postgres to Applications folder
5. Open Postgres.app from Applications
6. Click "Initialize" to create a database
7. PostgreSQL is now running! 🎉

**Connection String:**
```
postgresql://postgres@localhost:5432/perfect_match
```

---

## **Option 2: Docker (Easiest if you have Docker)**

### 👉 Download Link: https://www.docker.com/products/docker-desktop/

**Steps:**
1. Install Docker Desktop for Mac (FREE)
2. Open Terminal and run:

```bash
docker run --name perfect-match-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=perfect_match \
  -p 5432:5432 \
  -d postgres:15
```

**Connection String:**
```
postgresql://postgres:password@localhost:5432/perfect_match
```

**To start/stop:**
```bash
docker start perfect-match-db
docker stop perfect-match-db
```

---

## **Option 3: Homebrew (Requires Admin Access)**

### 👉 Install Homebrew First:

**Open Terminal and run:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Then install PostgreSQL:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Connection String:**
```
postgresql://postgres@localhost:5432/perfect_match
```

---

## **Option 4: Manual Installation (Without Package Manager)**

### 👉 Download Link: https://www.postgresql.org/download/macosx/

**Steps:**
1. Go to: https://www.postgresql.org/download/macosx/
2. Download "EnterpriseDB" installer (FREE)
3. Run the installer
4. Set a password for postgres user (remember it!)
5. Complete installation

**Connection String:**
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/perfect_match
```

---

## **Option 5: Use Cloud Database (Skip Installation)**

### 👉 Supabase (FREE - No Installation Needed!)

**Steps:**
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (FREE)
4. Create new project
5. Get connection string from dashboard

**Connection String (from Supabase):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

---

## ✅ **Recommended: Use Postgres.app (Option 1)**

**Why?**
- ✅ Easiest to install
- ✅ No command line needed
- ✅ FREE
- ✅ One-click start/stop
- ✅ Works perfectly with macOS

---

## 🎯 **Quick Setup (Postgres.app - 2 minutes)**

### **Step 1: Download**
Go to: https://postgresapp.com/downloads.html
Click "Download"

### **Step 2: Install**
- Open the .dmg file
- Drag Postgres to Applications
- Open Postgres.app

### **Step 3: Initialize**
- Click "Initialize" button
- Wait 30 seconds
- Done! ✓

### **Step 4: Verify**
Open Terminal and run:
```bash
psql postgres
```

If you see a postgres prompt, it's working! Type `\q` to quit.

---

## 📝 **After Installation**

### **Update your `backend/.env` file:**

```bash
DATABASE_URL=postgresql://postgres@localhost:5432/perfect_match
```

**Note:** No password needed for Postgres.app default setup.

---

## 🧪 **Test Connection**

Run this command to test:
```bash
cd backend
npx prisma db push
```

If successful, PostgreSQL is ready! ✅

---

## 🆘 **Troubleshooting**

### **Port 5432 already in use?**
```bash
# Check what's using port 5432
lsof -i :5432

# Kill the process
kill -9 [PID]
```

### **Can't connect to PostgreSQL?**
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL manually
# For Postgres.app: Just open the app
# For Homebrew:
brew services start postgresql@15
# For Docker:
docker start perfect-match-db
```

### **Permission denied?**
```bash
# Fix permissions for PostgreSQL data directory
sudo chown -R $(whoami) /usr/local/var/postgresql@15
```

---

## 📚 **Documentation Links**

- **Postgres.app Guide:** https://postgresapp.com/documentation/
- **PostgreSQL Official Docs:** https://www.postgresql.org/docs/
- **Prisma PostgreSQL Guide:** https://www.prisma.io/docs/concepts/database-connectors/postgresql

---

## 🎉 **Summary**

**Easiest option for macOS:**
1. Download Postgres.app: https://postgresapp.com
2. Install and open
3. Click "Initialize"
4. Done! (2 minutes total)

**No command line experience needed!**

---

**After PostgreSQL is installed:**
```bash
cd /Users/hoon/Desktop/wizardmatch
./setup.sh
```

The setup script will handle the rest! 🚀
