# Spare Parts Finder - Personal Use Documentation

This application helps you manage and search your spare parts inventory. Data is stored on the Internet Computer blockchain with a 7-day retention policy.

## Table of Contents

1. [Running Locally](#running-locally)
2. [Deploying to the Internet Computer](#deploying-to-the-internet-computer)
3. [Data Storage & Retention](#data-storage--retention)
4. [Backup & Restore](#backup--restore)
5. [Draft vs Live Environments](#draft-vs-live-environments)
6. [Maintenance Password](#maintenance-password)

---

## Running Locally

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- DFX (Internet Computer SDK)

### Steps

1. **Install dependencies:**
   ```bash
   cd frontend
   pnpm install
   ```

2. **Start the local Internet Computer replica:**
   ```bash
   dfx start --clean --background
   ```

3. **Deploy the backend canister locally:**
   ```bash
   dfx deploy backend
   ```

4. **Generate TypeScript bindings:**
   ```bash
   dfx generate backend
   ```

5. **Start the frontend development server:**
   ```bash
   pnpm start
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

---

## Deploying to the Internet Computer

### Deploy Backend Canister

1. **Ensure you have cycles (ICP tokens) in your wallet**

2. **Deploy to mainnet:**
   ```bash
   dfx deploy --network ic backend
   ```

3. **Note your canister ID:**
   After deployment, DFX will display your backend canister ID. Save this for reference.

### Deploy Frontend

The frontend is typically deployed through the Caffeine platform:

1. Push your code to your repository
2. Use the Caffeine platform to publish your app
3. Choose a domain slug (5-50 characters, letters/numbers/hyphens only)
4. Your app will be available at `https://your-slug.caffeine.xyz`

---

## Data Storage & Retention

### How Data is Stored

- **Backend Storage:** Spare parts data is stored in the Internet Computer canister's stable memory
- **Retention Period:** Data is retained for **7 days** from the time of upload
- **Automatic Expiry:** After 7 days, the data is automatically cleared from the backend

### What Happens on Backend Upgrade

When you redeploy or upgrade your backend canister:

- **Data Persists:** Your spare parts data is preserved through upgrades using Motoko's stable variables
- **Retention Timer:** The 7-day countdown continues from the original upload time (not reset by upgrades)
- **Password Preserved:** Your maintenance password is also preserved through upgrades

### Checking Retention Status

The app displays a retention notice at the top showing:
- Time remaining until data expires (in days/hours)
- A warning when data is close to expiring
- Clear indication when data has expired

---

## Backup & Restore

### Automatic Local Backup

Every time you successfully import spare parts data:
- A backup is automatically saved to your browser's localStorage
- This backup includes all spare parts with metadata (timestamp, record count)
- The backup persists even if you close your browser

### Downloading Backup

1. After importing data, you'll see a "Local Backup Available" section
2. Click **"Download Backup (JSON)"** to save a JSON file to your computer
3. This file can be stored safely and used to restore data later

### Restoring from Backup

If your backend data expires or is lost:

1. **Unlock upload access** by entering your maintenance password
2. In the "Local Backup Available" section, click **"Restore from Backup"**
3. The app will re-import your backed-up data to the backend
4. Your table will update with the restored data

**Note:** Restore requires the maintenance password (same unlock flow as regular imports).

### Best Practices

- **Download backups regularly** to have an offline copy
- **Keep backups safe** - they contain your complete inventory
- **Restore promptly** if data expires to avoid manual re-entry
- **Publish to Live** (see below) to avoid Draft expiry issues

---

## Draft vs Live Environments

### Draft Environment

- **URL Pattern:** `draft-*.caffeine.xyz` or preview URLs
- **Purpose:** Testing and development
- **Data Availability:** Draft apps can expire after periods of inactivity
- **Impact:** When a draft expires, you may need to rebuild/redeploy, and backend data might be lost

### Live Environment

- **URL Pattern:** `your-slug.caffeine.xyz` (your chosen domain)
- **Purpose:** Production use
- **Data Availability:** Live apps stay online continuously
- **Impact:** Data persists according to the 7-day retention policy (not affected by app expiry)

### Recommended Actions

1. **For Testing:** Use Draft environment, but keep backups
2. **For Production:** Publish to Live to ensure continuous availability
3. **After Draft Expiry:** Use the restore feature to recover your data from local backup
4. **Regular Backups:** Download JSON backups regardless of environment

### Publishing to Live

1. In the app header, click the **"Publish to Live"** button
2. Follow the instructions in the Caffeine platform
3. Choose your domain slug
4. Verify deployment using the built-in smoke test panel

---

## Maintenance Password

### Default Password

The default maintenance password is: `Kiml@5973`

**Important:** Change this password immediately after first deployment!

### Changing Password

1. Unlock upload access with your current password
2. Scroll to the "Change maintenance password" section
3. Enter:
   - Current password
   - New password
   - Confirm new password
4. Click **"Change Password"**

### Password Security

- Passwords are stored securely in the backend canister
- Passwords persist through backend upgrades
- Only the password holder can import/restore data
- Keep your password safe - there is no recovery mechanism

---

## Troubleshooting

### Backend Unavailable

If you see "Backend is currently unavailable":
- Check your internet connection
- Verify the backend canister is deployed and running
- Click the retry button to reconnect

### Data Not Showing After Restore

- Ensure you're unlocked with the correct password
- Check that the restore operation completed successfully
- Refresh the page to reload data from backend

### Excel Import Fails

- Verify your Excel file has the correct format
- Ensure column headers match expected names (Part Number, Description, etc.)
- Check that the file is not corrupted

### Draft App Expired

- Rebuild the app through the Caffeine platform
- Use the restore feature to recover your data from local backup
- Consider publishing to Live for continuous availability

---

## Support

For issues or questions:
- Check the browser console for detailed error messages
- Verify your backend canister is running: `dfx canister status backend`
- Review the retention status in the app header

---

**Built with ❤️ using [caffeine.ai](https://caffeine.ai)**
