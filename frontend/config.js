// Single source of truth for the API base URL.
//
// The backend listens on port 8080 (see backend/server.js and the PORT entry
// in .env.example). `localhost` works for a web build or an emulator sharing
// the host's network stack; on a physical device, point this at the LAN IP of
// the machine running the API, because localhost there resolves to the device
// itself.
export const API_BASE = 'http://localhost:8080';
