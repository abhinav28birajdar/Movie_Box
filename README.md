# 🎥 Movie Box

**Movie Box** is a movie discovery and information app built using **Expo**, **TypeScript**, and **NativeWind**. It allows users to explore trending movies, search for specific titles, view detailed movie data, and save their favorites to a personal account via Supabase.

Designed to deliver a smooth and visually appealing experience, Movie Box connects to the **TMDB API** to bring real-time content directly to your device.

---

## 🚀 Features

- 📽️ Browse trending, popular, top-rated, and upcoming movies in real-time  
- 🔍 Search for movies by title or keyword  
- 📄 View full movie details — synopsis, ratings, release date, genres, and more  
- 🎬 Watch official trailers (if available)  
- 💾 Save movies to your personal watchlist via Supabase
- 👤 Authentication system using Supabase (signup, login, profile management)
- 🔄 View similar movies based on what you're watching
- 🎨 Beautiful and responsive UI powered by NativeWind

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js and npm installed
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- TMDB API key

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Once your project is created, navigate to the SQL Editor
3. Execute the SQL queries in the `supabase/schema.sql` file to set up the database schema and security rules
4. In Authentication settings, ensure Email Sign Up is enabled

### Environment Setup

1. Modify the `.env` file in the project root:

```
API_KEY=your_tmdb_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npx expo start
   ```

---

## 🏗️ Project Structure

- `/app`: Main application screens using Expo Router
- `/src`: Source code organized by feature
  - `/api`: API clients for Supabase and TMDB
  - `/auth`: Authentication context and hooks
  - `/components`: Reusable UI components
  - `/navigation`: Navigation configuration
  - `/screens`: Screen components for the application
  - `/utils`: Utility functions and constants
- `/assets`: Images, fonts, and other static assets
- `/supabase`: SQL schema for Supabase setup

---

> Built to enhance your movie-watching experience — anytime, anywhere.
