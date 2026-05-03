# APKVault – GitHub-Hosted APK Store

A complete Android APK store that runs **100% on GitHub**. No Firebase, no database, no cost.

---

## How It Works

```
Your GitHub Repo
├── data/apps.json        ← You edit this to add/remove apps
├── apks/                 ← Upload your .apk files here
├── images/
│   ├── icons/            ← App icons (PNG/JPG)
│   └── screenshots/      ← App screenshots
├── index.html            ← Homepage (public)
├── detail.html           ← App detail page
├── admin.html            ← JSON generator (helper tool)
├── app.js                ← All JavaScript
└── styles.css            ← All styling
```

---

## Step-by-Step Setup

### Step 1 – Create a GitHub Account
Go to https://github.com and sign up (free).

### Step 2 – Create a New Repository
1. Click the **+** icon (top right) → **New repository**
2. Name it: `apk-store` (or anything you like)
3. Set it to **Public** ← IMPORTANT (private repos can't use free GitHub Pages)
4. Check ✅ **Add a README file**
5. Click **Create repository**

### Step 3 – Upload the Website Files
1. In your new repo, click **Add file** → **Upload files**
2. Upload ALL these files at once:
   - `index.html`
   - `detail.html`
   - `admin.html`
   - `styles.css`
   - `app.js`
3. Click **Commit changes**

### Step 4 – Create the Folders & Upload data/apps.json
GitHub doesn't let you create empty folders, so:
1. Click **Add file** → **Create new file**
2. In the filename box type: `data/apps.json`
3. Paste this as the content:
   ```json
   []
   ```
4. Click **Commit new file**

### Step 5 – Create APK and Image Folders
Repeat for each folder by creating a placeholder file:

**For apks folder:**
1. Add file → Create new file
2. Name: `apks/.gitkeep`
3. Leave content empty → Commit

**For icons folder:**
1. Add file → Create new file
2. Name: `images/icons/.gitkeep`
3. Commit

**For screenshots folder:**
1. Add file → Create new file
2. Name: `images/screenshots/.gitkeep`
3. Commit

### Step 6 – Enable GitHub Pages
1. Go to your repo → **Settings** tab
2. Click **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**
6. Wait 1–2 minutes
7. Your site is live at: `https://YOUR_USERNAME.github.io/apk-store/`

---

## How to Add an App

### Method A – Using the Admin Panel (Easy)
1. Go to `https://YOUR_USERNAME.github.io/apk-store/admin.html`
2. Fill in the form
3. Click **Generate JSON Entry**
4. Copy the generated JSON
5. Go to your GitHub repo → `data/apps.json` → click ✏️ Edit
6. Paste inside the `[ ]` brackets
7. Commit → app appears in ~1 minute!

### Method B – Manual Edit (Direct)
Open `data/apps.json` on GitHub and add an entry like this:

```json
[
  {
    "id": "my-app",
    "name": "My App Name",
    "version": "1.0.0",
    "category": "Tools",
    "size": "15 MB",
    "shortDesc": "Short description shown on the card",
    "description": "Full description of the app.\n\nCan have multiple lines.\n\nFeatures:\n- Feature 1\n- Feature 2",
    "icon": "images/icons/my-app.png",
    "apkFile": "apks/my-app-v1.0.0.apk",
    "screenshots": [
      "images/screenshots/my-app-1.png",
      "images/screenshots/my-app-2.png"
    ],
    "downloads": 0,
    "rating": 0,
    "ratingCount": 0,
    "date": "2025-01-15",
    "versionHistory": [
      { "version": "1.0.0", "date": "2025-01-15", "note": "Initial release" }
    ]
  }
]
```

### For multiple apps, separate them with commas:
```json
[
  { ...app1... },
  { ...app2... },
  { ...app3... }
]
```

---

## How to Upload an APK File

1. Go to your GitHub repo
2. Click into the `apks/` folder
3. Click **Add file** → **Upload files**
4. Drag and drop your `.apk` file
5. Click **Commit changes**

> ⚠️ GitHub has a **25 MB file size limit** for files uploaded via the web interface.
> For larger APKs, use [Git LFS](https://git-lfs.github.com/) or host the APK on
> Google Drive / Telegram and put the **direct download link** in `apkFile`.

---

## Hosting Large APKs (Over 25 MB)

If your APK is bigger than 25 MB, upload it somewhere else and use a direct link:

**Google Drive:**
1. Upload APK to Google Drive
2. Right-click → **Share** → **Anyone with the link**
3. Copy the file ID from the URL: `https://drive.google.com/file/d/FILE_ID/view`
4. Use this as your apkFile URL:
   `https://drive.google.com/uc?export=download&id=FILE_ID`

**Telegram:**
1. Upload APK to any Telegram channel
2. Right-click the file → Copy link
3. Use that link as `apkFile`

In `apps.json` it would look like:
```json
"apkFile": "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
```

---

## File & Folder Reference

| Path | What goes here |
|------|----------------|
| `data/apps.json` | App metadata (you edit this) |
| `apks/` | APK files (max 25MB each via web) |
| `images/icons/` | App icons (PNG/JPG, ~512×512px) |
| `images/screenshots/` | App screenshots (any size) |

---

## Updating an App

1. Upload the new APK to `apks/` folder
2. Edit `data/apps.json`
3. Change the `version` field
4. Add a new entry to `versionHistory`:
   ```json
   { "version": "2.0.0", "date": "2025-06-01", "note": "Bug fixes and new features" }
   ```
5. Commit → site updates in ~1 minute

---

## Removing an App

1. Open `data/apps.json` → Edit
2. Delete the entire `{ ... }` block for that app
3. Make sure remaining entries are comma-separated correctly
4. Commit

---

## Features

- ✅ Homepage with app grid
- ✅ Search (name, description, category)
- ✅ Category filter buttons
- ✅ Sort by newest / A–Z / top rated
- ✅ Individual app detail page
- ✅ Screenshot gallery
- ✅ APK download button
- ✅ Version history
- ✅ Star rating (stored locally per-device)
- ✅ Dark / light mode toggle
- ✅ Mobile responsive
- ✅ Admin panel (JSON generator)
- ✅ SEO-friendly (meta tags)
- ✅ Zero cost, zero backend

---

## Troubleshooting

**Site shows 404**
→ Make sure GitHub Pages is enabled (Settings → Pages → main branch)

**Apps not showing**
→ Check `data/apps.json` has valid JSON. Paste it at https://jsonlint.com to check.

**Images broken**
→ Make sure icon filename in `apps.json` exactly matches the filename in `images/icons/`

**APK not downloading**
→ Make sure APK filename in `apps.json` exactly matches the file in `apks/`

**Changes not showing**
→ GitHub Pages can take 1–2 minutes. Hard-refresh your browser (Ctrl+Shift+R)
