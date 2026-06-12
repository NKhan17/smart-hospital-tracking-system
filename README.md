# Smart Hospital Tracking and Appointment System
*A real-time, low-latency polymorphic healthcare queue management and spatial tracking platform.*

## 🏗️ System Architecture & Topology Mapping
The application utilizes a fully decoupled, modern architecture:
- **Client (Frontend)**: Built on **Next.js 15 (React)** using Server-Side Rendering (SSR) for ultra-fast initial loads during emergencies. Styled with **Tailwind CSS v4** strictly following the Google Stitch Design language for a minimalist, razor-sharp workspace aesthetic.
- **REST API Router (Backend)**: Built with **Node.js & Express.js**. An event-driven API handling polymorphic document creation, cryptographic processes, and QR terminal generation.
- **Storage Cluster**: **MongoDB Atlas** acts as the primary data lake, using a single polymorphic `PatientProfiles` schema capable of fluidly capturing both human and veterinary attributes.
- **Real-Time Gateway**: Powered by **Socket.io (WebSockets)** to broadcast queue adjustments (e.g., when a patient checks in via terminal) to all city-wide frontend map clients instantaneously without reloading.

## 🔐 Security Blueprint
This application strictly adheres to cybersecurity-first methodologies:
- **AES-256-GCM Field-Level Encryption (At Rest)**: Highly private medical data (allergies, medical conditions, vaccinations) within the `PatientProfiles` collection are heavily encrypted before database insertion. Initialization Vectors (IVs) are uniquely instantiated per record, preventing cryptographic predictability.
- **JWT HttpOnly Security Layers**: Session and authorization payloads are handled strictly via secure `HttpOnly`, `SameSite=Strict` cookies to completely neutralize Cross-Site Scripting (XSS) extraction vectors.
- **Temporary Cryptographic Check-in Hashes (In Flight)**: The QR desk terminal uses a signed JWT that contains the `appointmentId` and timestamp, expiring after just 5 minutes. This prevents token tampering and duplicate replay attacks.

## 🚀 Local Quickstart Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NKhan17/smart-hospital-tracking-system.git
   cd smart-hospital-tracking-system
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   *Note: Ensure you configure the `.env` file containing the `MONGODB_URI` and `JWT_SECRET`.*
   ```bash
   node server.js
   ```

3. **Frontend Setup:**
   ```bash
   # Open a new terminal
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the System:**
   - Client Dashboard: `http://localhost:3000`
   - Staff Portal UI: `http://localhost:3000/staff`

## 🔌 API Route Endpoint Mappings

| Method | Path | Action | Security Requirement |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/profiles/` | Create a new polymorphic User/Pet Profile | Authenticated / Encrypted |
| `GET`  | `/api/profiles/` | Fetch profiles for logged-in user | Authenticated |
| `POST` | `/api/appointments/` | Book an appointment to a specific facility | Authenticated |
| `POST` | `/api/appointments/generate-qr` | Generate a short-lived cryptographically secure QR token | Staff Authenticated |
| `POST` | `/api/appointments/scan` | Verify check-in token and trigger WebSocket broadcast | Staff Authenticated |
