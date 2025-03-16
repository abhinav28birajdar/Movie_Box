# Movie Box

Movie Box is a movie discovery and information app built using **Expo, TypeScript, and NativeWind**. It fetches movie data from the **TMDB API**, allowing users to explore trending movies, search for specific films, and view detailed movie information.

## Features
- 📽️ Browse trending and popular movies
- 🔍 Search for movies by title
- 📄 View detailed movie information (synopsis, ratings, release date, etc.)
- 🎬 Watch movie trailers (if available)
- 🎨 Beautiful UI with NativeWind for styling

## Tech Stack
- **React Native** (with Expo)
- **TypeScript**
- **NativeWind** (Tailwind CSS for React Native)
- **TMDB API** (for fetching movie data)

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/movie-box.git
   cd movie-box
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add your **TMDB API Key**:
   ```env
   TMDB_API_KEY=your_tmdb_api_key
   ```
4. Start the Expo server:
   ```sh
   npx expo start
   ```

## API Configuration
- Sign up at [TMDB](https://www.themoviedb.org/) to get an API key.
- Store the key in the `.env` file as shown above.

## Project Structure
```
movie-box/
│── src/
│   ├── components/   # Reusable UI components
│   ├── screens/      # Application screens
│   ├── hooks/        # Custom hooks for API calls
│   ├── navigation/   # Navigation setup
│   ├── utils/        # Helper functions
│── App.tsx          # Main entry file
│── tailwind.config.js # NativeWind config
│── package.json
│── .env
```

## How to Contribute
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit: `git commit -m "Your commit message"`
4. Push to your fork: `git push origin feature-branch`
5. Open a Pull Request.

## Issues
If you find any bugs or have feature requests, please open an issue on [GitHub](https://github.com/yourusername/movie-box/issues).

## License
This project is licensed under the **MIT License**.

