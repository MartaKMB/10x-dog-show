# HovBase 🐾

<div align="center">
  <img src="logo.png" alt="HovBase Logo" width="200" height="auto">
</div>

---

## 🇵🇱 O projekcie

**HovBase** to nowoczesna aplikacja internetowa tworzona z myślą o miłośnikach i hodowcach rasy Hovawart w Polsce.  
Jej celem jest gromadzenie, archiwizowanie i udostępnianie **zweryfikowanej wiedzy** o wystawach klubowych, psach i historii rasy.

Projekt jest rozwijany jako inicjatywa społeczna i w przyszłości może stać się **oficjalnym narzędziem Klubu Hovawarta w Polsce**.  
Aktualna wersja aplikacji pozwala przeglądać dane, a uprawnieni członkowie Zarządu mogą dodawać i edytować informacje.

W planach:
- rozbudowa o profile hodowli, właścicieli, szczeniąt i szkolenia
- integracja ze statystykami i raportami rasy
- opcja przeglądania historii rodowodowej

---

## 🇬🇧 About the project

**HovBase** is a modern web application created for Hovawart enthusiasts and breeders in Poland.  
Its goal is to collect, archive and share **verified knowledge** about club shows, dogs and the breed's history.

The project is developed as a community initiative and has the potential to become the **official tool for the Hovawart Club of Poland**.  
The current version allows public browsing of data, while authorized Club Board members can add and edit information.

Planned features:
- Breeder, owner, puppy and training profiles
- Extended breed statistics and reports
- Pedigree history browsing

---

## 🎯 Key Features (MVP)

- 🏆 **Show Management** – Archiving club show data (dates, results, judges)
- 🐕 **Dog Profiles** – Verified dog entries with show history
- 📝 **Evaluation System** – Based on official FCI standards
- 📊 **Statistics** – Basic breed and show summaries
- 🔐 **User Management** – Access control for Club Board members
- 📱 **Responsive Design** – Works on desktop and mobile devices

---

## 📌 Future Enhancements

- Extended profiles (breeders, owners, puppies, trainings)  
- Advanced search and filtering  
- Report generation and data export  
- Pedigree tracking  
- Integration with external systems  

---

## 🛠 Tech Stack

**Frontend**
- Astro 5  
- React 19  
- TypeScript 5  
- Tailwind CSS 4  
- shadcn/ui  

**Backend & Database**
- Supabase (PostgreSQL, Auth, RLS, Storage, Realtime)

**Testing**
- Vitest, Playwright, React Testing Library, MSW

**Other**
- Resend (Email)
- DigitalOcean (Hosting)
- React-PDF (PDF generation)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (Latest LTS)
- npm or yarn
- Supabase account

### Installation
```bash
git clone <repository-url>
cd hovbase
npm install
```

### Environment variables
Create `.env` file in the root:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Run development server
```bash
npm run dev
```

The app will be available at `http://localhost:4321`

---

## 📊 Project Status

**Phase:** MVP Development  
✅ Project setup  
✅ Database schema  
🔄 Show & evaluation management in progress  
⏳ Extended statistics, user testing

---

## 📄 License

MIT License – see [LICENSE](LICENSE) file.

---

## 🤝 Contributing

HovBase is designed for the Hovawart Club of Poland.  
For contributions or questions, please contact m.muchabalcerek@gmail.com.

---

## 📋 Technical Details

### Available Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Build the application for production |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Run ESLint to check code quality     |
| `npm run lint:fix` | Fix ESLint errors automatically      |
| `npm run format`   | Format code with Prettier            |
| `npm run test`     | Run unit and integration tests       |

### Testing Environment

The project supports both local and cloud testing environments:

- **Local Testing**: Traditional development environment with local Supabase
- **Cloud Testing**: Production-like environment using Supabase cloud instance

#### Test Scripts

| Script                   | Description                             |
| ------------------------ | --------------------------------------- |
| `npm run test`       | Run unit and integration tests          |
| `npm run test:watch`     | Run tests in watch mode                 |
| `npm run test:coverage`  | Run tests with coverage report          |
| `npm run test:e2e:cloud` | Run e2e tests against cloud environment |
| `npm run test:all`       | Run all tests (unit + e2e)              |

### Project Scope Details

#### MVP Features (Phase 1)

**Show Management**
- Create, edit, and delete club shows
- Configure show dates, locations, and judges
- Manage show status (draft, completed)
- Access control based on show status and user authentication

**Dog & Owner Management**
- Complete dog profiles with identification data
- Owner information management
- Show participation history

**Evaluation System**
- Standard FCI evaluations in Polish:
  - Doskonała (Excellent)
  - Bardzo dobra (Very Good)
  - Dobra (Good)
  - Zadowalająca (Satisfactory)
  - Zdyskwalifikowana (Disqualified)
  - Nieobecna (Absent)
- Age classes and club titles
- Placement tracking (1st, 2nd, 3rd, 4th)

**User System**
- Single role: Club management with full permissions
- Secure authentication and session management
- User account administration
- Guest preview mode for unauthenticated users
- Status-based permissions for show editing

**Statistics & Reporting**
- Show participation statistics
- Evaluation distribution analysis
- Club title statistics
- Individual dog performance history

### Success Metrics

- **Data Accuracy**: 0% errors in show data
- **Data Entry Time**: <30 minutes per show
- **User Satisfaction**: >90% satisfaction rate
- **System Performance**: <2 seconds response time
- **Uptime**: 99.9% availability
- **Access Control**: 100% permission enforcement for show editing
- **Code Quality**: 30% line coverage, 20% branch coverage minimum
- **Test Reliability**: 100% pass rate for critical tests (auth, CRUD)
- **Cloud Testing**: 100% pass rate for e2e tests against production environment

## 📞 Support

For technical support or feature requests, please create an issue in the project repository or contact m.muchabalcerek@gmail.com.
