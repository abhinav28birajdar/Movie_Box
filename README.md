# MovieBox - Complete Setup Guide

## Overview
MovieBox is a comprehensive React Native mobile application built with Expo that serves as the ultimate companion for movie enthusiasts. Users can discover new movies, search for specific titles, maintain a personal watchlist, create custom movie lists, write reviews, and engage with a community of movie lovers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- A TMDB API account
- A Supabase account

### 1. Clone and Install Dependencies
```bash
cd "e:\programming\React Native\MovieBox"
npm install
```

### 2. Set Up TMDB API

1. Create an account at [The Movie Database](https://www.themoviedb.org/)
2. Go to Settings → API and create a new API key (v3 auth)
3. Copy your API key for configuration

### 3. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com/)
2. Note your project URL and anon key from Settings → API
3. Execute the database schema (see Database Setup section)

### 4. Configure Environment Variables

Edit `constants/env.ts` and replace the placeholder values:

```typescript
export const ENV_CONFIG = {
  TMDB_API_KEY: 'your_actual_tmdb_api_key_here',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  
  SUPABASE_URL: 'your_supabase_project_url_here',
  SUPABASE_ANON_KEY: 'your_supabase_anon_key_here',
};
```

### 5. Run the Application
```bash
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan the QR code with Expo Go app on your physical device

## 📁 Project Structure

```
MovieBox/
├── app/                          # Main app screens (Expo Router)
│   ├── _layout.tsx              # Root layout with auth provider
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── _layout.tsx          # Tab bar configuration
│   │   ├── index.tsx            # Home/Discovery screen
│   │   ├── search.tsx           # Movie search screen
│   │   ├── watchlist.tsx        # User's watchlist
│   │   ├── lists.tsx            # User's custom lists
│   │   └── profile.tsx          # User profile
│   └── modal.tsx                # Modal screens
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   │   ├── MovieCard.tsx        # Movie display card
│   │   ├── StarRating.tsx       # Rating component
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── EmptyState.tsx       # Empty state component
│   │   └── SectionHeader.tsx    # List section headers
│   └── navigation/              # Navigation components
│       └── AuthStack.tsx        # Authentication navigation
├── contexts/                    # React contexts
│   └── AuthContext.tsx          # Authentication context
├── constants/                   # App constants
│   ├── app.ts                   # Colors, sizes, layouts
│   └── env.ts                   # Environment configuration
├── database/                    # Database files
│   └── schema.sql               # Supabase database schema
├── lib/                         # Library configurations
│   └── supabase.ts              # Supabase client setup
├── screens/                     # Screen components
│   └── auth/                    # Authentication screens
│       ├── LoginScreen.tsx      # User login
│       └── SignUpScreen.tsx     # User registration
├── services/                    # API services
│   ├── tmdbService.ts           # TMDB API service
│   └── databaseService.ts       # Supabase database service
├── types/                       # TypeScript type definitions
│   └── index.ts                 # All app types
└── package.json                 # Dependencies and scripts
```

## 🗄️ Database Setup

### Execute SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire content from `database/schema.sql`
4. Execute the script

This will create:
- **profiles**: Extended user information
- **watchlists**: User's saved movies
- **reviews**: Movie ratings and reviews
- **lists**: Custom movie collections
- **list_movies**: Movies within custom lists
- Row Level Security (RLS) policies
- Storage bucket for avatars

### Enable Storage (Optional)

If you want avatar upload functionality:

1. Go to Storage → Buckets in Supabase dashboard
2. Create a new bucket named "avatars"
3. Set it to public
4. Apply the storage policies commented in the schema file

## 🏗️ Architecture Overview

### Frontend Architecture

The app follows a clean, modular architecture:

1. **Expo Router**: File-based routing system
2. **React Context**: State management for authentication
3. **Service Layer**: Abstracted API calls
4. **Component Library**: Reusable UI components
5. **TypeScript**: Full type safety

### Authentication Flow

1. User opens app → AuthContext checks for existing session
2. If no session → Show AuthStack (Login/SignUp)
3. If session exists → Show main app with tab navigation
4. Authentication state managed globally via React Context

### Data Flow

1. **TMDB API**: Movie metadata, search, discovery
2. **Supabase**: User data, authentication, storage
3. **Local State**: Component-level UI state
4. **Context**: Global authentication state

### Key Features Implementation

- **Movie Discovery**: TMDB API integration with horizontal scrollable lists
- **Search**: Debounced search with pagination
- **Watchlist**: Personal movie collection with CRUD operations
- **Custom Lists**: User-created movie collections
- **Reviews**: Star ratings and text reviews
- **Profile Management**: User settings and avatar upload

## 🎨 Design System

### Colors
- **Primary**: #007AFF (iOS Blue)
- **Background**: #000000 (Pure Black)
- **Surface**: #1C1C1E (Dark Gray)
- **Text**: #FFFFFF (White)
- **Secondary Text**: #8E8E93 (Light Gray)

### Typography
- **Sizes**: 10px to 32px with consistent scale
- **Weights**: Regular (400) to Bold (700)

### Components
- **Movie Cards**: 120x180px with rounded corners
- **Buttons**: Consistent padding and border radius
- **Lists**: Horizontal and vertical scrolling patterns

## 🔧 Configuration

### Customization Options

1. **Theme Colors**: Edit `constants/app.ts` → `COLORS`
2. **Sizing**: Modify `SIZES` object for fonts and spacing
3. **API Endpoints**: Update `API_ENDPOINTS` for different TMDB endpoints
4. **Image Sizes**: Adjust `constants/env.ts` → `IMAGE_SIZES`

### Environment Variables

For production, consider using:
- `expo-secure-store` for sensitive API keys
- Environment-specific config files
- Build-time environment variables

## 📱 Running on Devices

### iOS
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. For physical builds: Use EAS Build

### Android
1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. For physical builds: Use EAS Build

### Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🚀 Deployment

### Expo Application Services (EAS)

1. **Setup EAS**:
   ```bash
   eas login
   eas build:configure
   ```

2. **Build App**:
   ```bash
   # Development build
   eas build --profile development
   
   # Production build
   eas build --profile production
   ```

3. **Submit to App Stores**:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Environment Configuration

For different environments:

1. Create `eas.json` with build profiles
2. Set environment-specific variables
3. Configure app variants for development/staging/production

## 🧪 Testing

### Manual Testing Checklist

- [ ] User Registration/Login
- [ ] Movie Discovery (all sections)
- [ ] Search functionality
- [ ] Watchlist CRUD operations
- [ ] Custom Lists CRUD operations
- [ ] Profile management
- [ ] Network error handling
- [ ] Offline state handling

### Automated Testing Setup (Optional)

```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

## 🔍 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **iOS Simulator not working**:
   - Ensure Xcode is installed
   - Check iOS Simulator is running

3. **Android emulator issues**:
   - Verify Android Studio setup
   - Check emulator is running

4. **API errors**:
   - Verify TMDB API key is correct
   - Check Supabase credentials
   - Ensure network connectivity

### Debug Mode

Enable debug mode in Expo Dev Tools for:
- Network request monitoring
- Console logs
- Performance metrics

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [TMDB API Documentation](https://developers.themoviedb.org/3)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Movie data provided by The Movie Database (TMDB).

---

**Note**: Remember to never commit your actual API keys to version control. Use environment variables or secure storage in production.
