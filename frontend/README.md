# MyJob - Frontend

Frontend application for the Part-Time Job Finding Platform built with React.js and Vite.

## Features

- 🏠 Modern Home Page with job search functionality
- 📊 Statistics dashboard showing live jobs, companies, and candidates
- 🎯 Popular job categories with position counts
- 🔍 Job search with location filtering
- 🎨 Beautiful UI matching Figma design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Header.jsx   # Navigation header
│   │   ├── Hero.jsx     # Hero section with search
│   │   ├── Statistics.jsx # Statistics cards
│   │   ├── Categories.jsx # Job categories
│   │   └── CTA.jsx      # Call-to-action section
│   ├── pages/           # Page components
│   │   └── Home.jsx     # Home page
│   ├── services/        # API services
│   │   └── api.js       # API client and endpoints
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` by default. Make sure your backend is running before starting the frontend.

### Available API Endpoints

- `GET /api/JobPosts` - Get all job posts
- `GET /api/JobPosts/search` - Search job posts
- `GET /api/Companies` - Get all companies
- `POST /api/Auth/login` - User login
- `POST /api/Auth/register` - User registration

## Development

The app uses:
- **Vite** for fast HMR (Hot Module Replacement)
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing

## Notes

- The statistics section fetches real data from the API when available, with fallback to mock data
- Category counts are fetched dynamically from the backend
- The search functionality is ready to be connected to a search results page

