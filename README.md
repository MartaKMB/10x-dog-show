# 10x Dog Show

A modern web application for managing and archiving dog show results, specifically designed for the Hovawart Club. Built with Astro, React, and Supabase to provide a comprehensive solution for show organizers, judges, and dog owners.

## 📋 Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## 🎯 Project Description

10x Dog Show is a web application designed to centralize and manage dog show results for the Hovawart Club. The system provides a comprehensive platform for archiving historical show data, managing evaluations, and generating statistics for club management.

### Key Features (MVP)

- **Show Management**: Create, edit, and manage club shows with dates, locations, and judges
- **Dog Registration**: Complete CRUD operations for dogs and their owners
- **Evaluation System**: Standard FCI evaluations with Polish language support
- **User Management**: Secure authentication system for club management
- **Statistics & Reports**: Basic show statistics and performance analytics
- **Responsive Design**: Full functionality on desktop and mobile devices

### Target Users

- **Club Management**: Full access to all show data and administrative functions
- **Show Organizers**: Tools for entering and managing show results
- **Dog Owners & Breeders**: Access to historical results and performance data

## 🛠 Tech Stack

### Frontend

- **Astro 5** - Static site generator with SSR capabilities
- **React 19** - Interactive UI components
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/ui** - Accessible React components

### Backend & Database

- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Built-in authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
  - File storage

### Development Tools

- **ESLint + Prettier** - Code quality and formatting
- **Husky + lint-staged** - Git hooks for code quality
- **TypeScript ESLint** - TypeScript-specific linting rules

### Testing

- **Vitest** - Fast unit and integration testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing for browser automation
- **MSW** - API mocking for integration tests

#### Testing Environment

The project supports both local and cloud testing environments:

- **Local Testing**: Traditional development environment with local Supabase
- **Cloud Testing**: Production-like environment using Supabase cloud instance

#### Test Scripts

| Script                   | Description                             |
| ------------------------ | --------------------------------------- |
| `npm run test:run`       | Run unit and integration tests          |
| `npm run test:watch`     | Run tests in watch mode                 |
| `npm run test:coverage`  | Run tests with coverage report          |
| `npm run test:e2e:cloud` | Run e2e tests against cloud environment |
| `npm run test:e2e:ui`    | Run e2e tests with UI                   |
| `npm run test:all`       | Run all tests (unit + e2e)              |

### External Services

- **Resend** - Email delivery service
- **React-PDF** - PDF generation
- **DigitalOcean** - Application hosting

## 🚀 Getting Started Locally

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 10x-dog-show
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with your Supabase credentials:

   ```env
   # Local Development Environment
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Cloud Testing Environment (Optional)
   VITE_SUPABASE_URL_CLOUD=your_cloud_supabase_url
   VITE_SUPABASE_ANON_KEY_CLOUD=your_cloud_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY_CLOUD=your_cloud_service_role_key

   # Test Environment Selection
   TEST_ENVIRONMENT=local  # or 'cloud'
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the database migrations from `supabase/migrations/`
   - Configure Row Level Security policies

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:4321` to view the application

## 📜 Available Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Build the application for production |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Run ESLint to check code quality     |
| `npm run lint:fix` | Fix ESLint errors automatically      |
| `npm run format`   | Format code with Prettier            |
| `npm run astro`    | Run Astro CLI commands               |
| `npm run test`     | Run unit and integration tests       |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run test:ui`  | Run tests with Vitest UI             |

## 🎯 Project Scope

### MVP Features (Phase 1)

#### Show Management

- Create, edit, and delete club shows
- Configure show dates, locations, and judges
- Manage show status (planned, in progress, completed)

#### Dog & Owner Management

- Complete dog profiles with identification data
- Owner information management
- Show participation history

#### Evaluation System

- Standard FCI evaluations in Polish:
  - Doskonała (Excellent)
  - Bardzo dobra (Very Good)
  - Dobra (Good)
  - Zadowalająca (Satisfactory)
  - Zdyskwalifikowana (Disqualified)
  - Nieobecna (Absent)
- Age classes and club titles
- Placement tracking (1st, 2nd, 3rd, 4th)

#### User System

- Single role: Club management with full permissions
- Secure authentication and session management
- User account administration

#### Statistics & Reporting

- Show participation statistics
- Evaluation distribution analysis
- Club title statistics
- Individual dog performance history

### Future Enhancements (Phase 2 & 3)

- Dog descriptions and detailed profiles
- Advanced reporting and data export
- Integration with external systems
- Membership management
- Pedigree tracking
- Competition management

## 📊 Project Status

**Current Phase**: MVP Development (Phase 1)

### Development Progress

- ✅ Project setup and configuration
- ✅ Database schema design
- ✅ Basic authentication system
- ✅ Core CRUD operations
- ✅ Testing infrastructure migration to cloud
- 🔄 Show management interface
- 🔄 Evaluation system implementation
- 🔄 Statistics and reporting
- ⏳ User testing and refinement

### Success Metrics

- **Data Accuracy**: 0% errors in show data
- **Data Entry Time**: <30 minutes per show
- **User Satisfaction**: >90% satisfaction rate
- **System Performance**: <2 seconds response time
- **Uptime**: 99.9% availability
- **Code Quality**: 30% line coverage, 20% branch coverage minimum
- **Test Reliability**: 100% pass rate for critical tests (auth, CRUD)
- **Cloud Testing**: 100% pass rate for e2e tests against production environment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

This project is specifically designed for the Hovawart Club. For contributions or questions, please contact the project maintainers.

## 📞 Support

For technical support or feature requests, please create an issue in the project repository or contact the development team.
