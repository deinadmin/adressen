# Setup-Anleitung Adressverwaltung

Diese App wurde mit Next.js, ShadCN UI und Firebase Firestore entwickelt.

## 1. Voraussetzungen
- Node.js 18+ installiert
- Ein Firebase-Projekt mit Firestore aktiv

## 2. Firebase Konfiguration
Erstellen Sie eine Datei `.env.local` im Hauptverzeichnis und fügen Sie Ihre Firebase-Daten hinzu:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 3. Firestore Datenmodell Setup
Erstellen Sie in Ihrer Firestore-Datenbank folgende Collections:

### `addresses`
Felder:
- `firstName`: string
- `lastName`: string
- `street`: string
- `houseNumber`: string
- `zipCode`: string
- `city`: string
- `country`: string
- `createdAt`: serverTimestamp
- `updatedAt`: serverTimestamp

### `invitationCodes`
Felder:
- `code`: string (z.B. "WELCOME2024")
- `isValid`: boolean
- `description`: string (optional)

## 4. Installation & Start
```bash
npm install
npm run dev
```

Die App ist nun unter `http://localhost:3000` erreichbar.
