# RailSarthi Frontend

Next.js frontend for the RailSarthi Flask API.

Endpoints used:
- /api/stations/search?q=
- /api/trains/search?q=
- /api/trains-between/<from_stn>/<to_stn>
- /api/live-status/<train_number>
- /api/timetable/<train_number>
- /api/coach-position/<train_number>
- /api/announcement/<train_number>?language=

Autocomplete starts at 3 characters with a 300ms debounce.

Run:
npm install
cp .env.example .env.local
npm run dev

Set NEXT_PUBLIC_API_BASE_URL to the Flask backend URL.

Put your railway photos in public/images/.
