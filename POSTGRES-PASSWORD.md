# 🔐 PostgreSQL Password Setup Guide

## **PostgreSQL is running on your Mac, but we need the password!**

### **Option 1: Find Your PostgreSQL Password (Easiest)**

When you installed PostgreSQL 17, you set a password for the `postgres` user.

**Try these common passwords:**
- Your Mac login password
- `postgres`
- `password`
- `postgres` + your name

**Or find it in PostgreSQL app:**
1. Open "PostgreSQL 17" from Applications
2. It might show your saved credentials

---

### **Option 2: Reset PostgreSQL Password (Recommended)**

Open Terminal and run:

```bash
# Stop PostgreSQL server
sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl stop -D /Library/PostgreSQL/17/data

# Start in single-user mode (no password required)
sudo -u postgres /Library/PostgreSQL/17/bin/postgres --single -D /Library/PostgreSQL/17/data

# Type these commands (one at a time):
ALTER USER postgres WITH PASSWORD 'postgres';
\q

# Restart PostgreSQL
sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl start -D /Library/PostgreSQL/17/data
```

**New password will be: `postgres`**

---

### **Option 3: Use pgAdmin to Reset Password**

1. Open pgAdmin (installed with PostgreSQL 17)
2. Try to connect with saved credentials
3. If connected, right-click on "postgres" user
4. Select "Change Password"
5. Set new password

---

### **Option 4: Use Existing User "hoon"**

Create a password for your Mac user:

```bash
# Connect as postgres superuser (requires postgres password)
/Library/PostgreSQL/17/bin/psql -U postgres

# Then run:
CREATE USER hoon WITH PASSWORD 'hoon';
ALTER USER hoon WITH SUPERUSER;
\q
```

---

## ✅ **After You Have the Password:**

### **Update `backend/.env`:**

```bash
# Replace YOUR_PASSWORD with your actual PostgreSQL password
DATABASE_URL=postgresql://hoon:YOUR_PASSWORD@localhost:5432/perfect_match?schema=public
```

### **Then run:**

```bash
cd /Users/hoon/Desktop/wizardmatch/backend
npx prisma db push
npx prisma db seed
```

---

## 🚀 **Quick Fix (If You Just Want to Proceed)**

Use this to reset the postgres password to "postgres":

```bash
# Stop PostgreSQL
sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl stop -D /Library/PostgreSQL/17/data

# Start in single-user mode
/Library/PostgreSQL/17/bin/postgres --single -D /Library/PostgreSQL/17/data <<EOF
ALTER USER postgres WITH PASSWORD 'postgres';
\q
EOF

# Restart PostgreSQL
sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl start -D /Library/PostgreSQL/17/data
```

Then update your `backend/.env`:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/perfect_match?schema=public
```

---

## 💡 **Alternative: Use Docker (Skip Password Issues)**

If password issues continue, use Docker instead:

```bash
# Stop existing PostgreSQL (optional)
sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl stop -D /Library/PostgreSQL/17/data

# Run PostgreSQL in Docker
docker run --name perfect-match-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=perfect_match \
  -p 5432:5432 \
  -d postgres:15

# Then use this DATABASE_URL:
DATABASE_URL=postgresql://postgres:password@localhost:5432/perfect_match?schema=public
```

---

## 📞 **Still Stuck?**

Check PostgreSQL logs:
```bash
tail -f /Library/PostgreSQL/17/data/log/postgresql-*.log
```

Or try pgAdmin app to see connection details.
