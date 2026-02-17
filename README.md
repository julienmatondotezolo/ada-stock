# AdaStock Frontend

Complete PWA stock management application for L'Osteria restaurant with multilingual support (Dutch/French/English) and real-time inventory tracking.

## Features

- 📱 **Progressive Web App (PWA)** - Works offline, installable on mobile devices
- 🌍 **Multilingual** - Dutch (default), French, English with complete translations
- 📊 **Real-time Dashboard** - Live stock status, alerts, and category overviews
- 🔍 **Smart Search & Filtering** - Find products quickly with advanced filters
- ⚡ **Quick Actions** - -5/-1/Edit/+1/+5 quantity controls for efficient management
- 📋 **List & Card Views** - Toggle between compact list and detailed card layouts
- 📝 **Complete CRUD** - Create, Read, Update, Delete products with validation
- 🎨 **Ada Green Theme** - Custom design system optimized for restaurant use
- 📲 **Mobile-First** - Touch-optimized UI with 44px minimum touch targets
- 🔧 **Unit Translations** - All measurement units localized (kg, L, pcs, etc.)

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4 + Custom Ada Design System
- **Language:** TypeScript
- **State Management:** React Hooks + Custom LocaleProvider
- **API Integration:** REST API with auto-detection (localhost/network/production)
- **PWA:** Next.js built-in PWA capabilities with manifest

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ada-stock

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Local Development
NEXT_PUBLIC_API_URL=http://localhost:3055
NODE_ENV=development
```

The production `.env` file is already configured for Vercel deployment.

### Available Scripts

- `npm run dev` - Start development server on http://localhost:3200
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. The `.env` file is already configured for production
3. Deploy automatically on push to main branch

### Environment Configuration

The app automatically detects the backend URL:
- **Production:** Uses `NEXT_PUBLIC_API_URL` from `.env`
- **Network:** Auto-detects `192.168.0.188:3055` for local network testing
- **Local:** Falls back to `localhost:3055`

## Localization

### Adding New Languages

1. Create a new JSON file in `src/messages/` (e.g., `de.json`)
2. Copy the structure from `nl.json` and translate all keys
3. Add the language to `src/i18n/config.ts`
4. Update the `LanguageSwitcher` component

### Translation Keys Structure

```json
{
  "app": { "title": "AdaStock" },
  "product": { "name": "Product Name" },
  "categories": { "vegetables": "Vegetables" },
  "units": { "kg": "kg", "pcs": "pieces" },
  "validation": { "nameRequired": "Name is required" }
}
```

## API Integration

The frontend communicates with the AdaStock Backend via REST API:

- **Products:** CRUD operations, quantity updates, search/filter
- **Categories:** Product categorization and organization
- **Dashboard:** Statistics, alerts, and recent activity
- **Health Check:** Service status monitoring

## PWA Features

- **Offline Support:** Basic functionality works without internet
- **Installable:** Add to home screen on mobile devices
- **App Shortcuts:** Quick access to common actions
- **Push Notifications:** Stock alerts (planned)

## Design System

### Ada Green Theme
- Primary: `#22c55e` (Ada Green)
- Success: `#16a34a`
- Warning: `#f59e0b`
- Error: `#dc2626`

### Typography
- Ada font sizes: `ada-xs` to `ada-4xl`
- Touch-optimized: 44px minimum target size
- Responsive breakpoints for mobile/tablet/desktop

## Testing

### E2E Tests (Playwright)

```bash
# Install Playwright
npx playwright install

# Run tests
npm run test:e2e

# Run specific test
npx playwright test jessica-inventory-management.spec.ts
```

### Test Coverage

- ✅ Product CRUD operations
- ✅ Quantity management workflows
- ✅ Search and filtering
- ✅ Multilingual switching
- ✅ Mobile responsiveness
- ✅ Network timeout handling
- ✅ Edge cases and validation

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── LocaleProvider.tsx  # Internationalization
│   ├── ProductList*.tsx    # Product management
│   └── Stock*.tsx          # Dashboard components
├── messages/               # Translation files
├── services/               # API communication
└── utils/                  # Utility functions
```

## Contributing

1. Create a feature branch
2. Follow the existing code style
3. Add tests for new features
4. Ensure all translations are updated
5. Test on mobile devices

## Support

For issues related to:
- **API:** Check the AdaStock Backend repository
- **Database:** Verify Supabase connection
- **Deployment:** Check environment variables
- **Mobile:** Test PWA installation and offline features

---

Built with ❤️ for L'Osteria Deerlijk restaurant management.