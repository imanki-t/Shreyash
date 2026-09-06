# 📁 THE SHREYASH FILES
### Central Archive of Special Incidents // United States Federal Archive

> *"Some incidents are too important to be forgotten."* &mdash; **OFFICE OF SPECIAL INCIDENT OVERSIGHT**

An authentic, deadpan federal classified intelligence records database and memory vault built to surprise and document our friend Shreyash. Designed with an austere government agency aesthetic (styled after the FBI Vault, CIA FOIA Reading Room, and DoD classified depositories), it catalogs multi-game digital simulations, audio wiretap intercepts, and photographic evidence with 100% bureaucratic seriousness.

---

## 🏛️ Core Features

- **Panoramic Federal Header**: Circular bureau seal insignia with wide-eyed mascot crest, live pulsing security LED (`NETWORK STATUS: SECURE`), and operative clearance status.
- **Subject Dossier (`/identity`)**: Complete federal Person of Interest profile for Shreyash, with measurement grid mugshot, vital statistics, verbatim verbal intercepts, and editable wholesome concluding evaluation.
- **Incident Deposition Terminal (`/upload`)**: Bureaucratic intake console with rich narrative formatting, interactive blackout redactions (`||text||`), passkey authorization, and multi-file GridFS media uploads.
- **Surveillance Media Streaming (`/api/media/[id]`)**: High-performance streaming pipeline directly from MongoDB GridFS with full HTTP 206 Partial Content range support for audio/video scrubbing.
- **Corroboration Console**: Official rubber stamps (`VERIFIED ACCURATE`, `CORROBORATED`, `FLAGGED ANOMALY`, `DISCREPANCY DETECTED`) with live counters, 5-point incident severity gauge, and emoji reactions.
- **Investigator Field Log**: Chronological lightweight message stream under every case record for operative field notes and banter.
- **Intelligence Dockets (`/archive/[docket]`)**: Multi-category file catalog with dynamic "Open New Docket" creation for various multiplayer game titles and operations.
- **Directorate Oversight Console (`/admin`)**: Master control center exclusively unlocked when authenticated as `imitsankit@gmail.com`, allowing record auditing, de-censoring, and expunging.
- **Print & PDF Declassification**: Official print stylesheet (`window.print()`) formatted to produce authentic declassified physical FOIA case files.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ (Tested on Node.js 24)
- npm 9+

### 2. Installation
```bash
git clone https://github.com/imanki-t/Shreyash.git
cd Shreyash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update your `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shreyash_files?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=classified-encryption-key-minimum-32-chars-long
ADMIN_EMAIL=imitsankit@gmail.com
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Render

This repository is pre-configured with `render.yaml` for 1-click or Git-connected deployment on Render:

1. Create a **New Web Service** on [Render.com](https://render.com).
2. Connect your GitHub repository `imanki-t/Shreyash`.
3. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in the Render Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `NEXTAUTH_URL`: Your Render service URL (e.g. `https://the-shreyash-files.onrender.com`).
   - `NEXTAUTH_SECRET`: Any random 32-character string.
   - `ADMIN_EMAIL`: `imitsankit@gmail.com`
   - `GOOGLE_CLIENT_ID`: (Optional) Google Cloud OAuth Client ID for Google login.
   - `GOOGLE_CLIENT_SECRET`: (Optional) Google Cloud OAuth Client Secret.
5. Deploy!

---

## 🛡️ Clearance & Access Tiers

- **Guest Operatives**: Can browse all unclassified records, search cases, and file depositions using an Agent Passkey.
- **Authenticated Operatives**: Log in with Google to have submissions automatically attributed.
- **Lead Directorate (`imitsankit@gmail.com`)**: Possesses master clearance to edit the central Subject Dossier, manage dockets, and de-censor or shred any case file across the entire repository.

---

*Classification: TOP SECRET // RESTRICTED ACCESS // DIVISION 04*
