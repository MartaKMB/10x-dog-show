# 10x Dog Show

A modern web application for digitizing and streamlining dog show documentation processes. This application replaces the traditional manual paper-based system with a digital solution that improves accuracy, speed, and efficiency in dog show evaluations.

## Project Description

10x Dog Show addresses the critical inefficiencies in traditional dog show documentation where ring secretaries manually transcribe judges' evaluations on paper forms. The current process suffers from:

- **Poor readability** of handwritten notes
- **Inaccuracy** in transcriptions
- **Slow documentation** process
- **Paper waste** and environmental impact
- **Difficulties** in archiving and searching historical data

### Key Features

- **Digital Dog Show Management**: Create, edit, and manage show templates with configurable dates, locations, and participants
- **Real-time Documentation**: Create, edit, and review dog descriptions with time-based editing restrictions
- **User Role Management**: Multi-level access control with different permissions for representatives, secretaries, and judges
- **Automated Communication**: Automatic PDF generation and email delivery of dog descriptions to owners
- **Configurable Evaluation System**: Customizable sets of evaluations, titles, and placements for different dog classes
- **GDPR Compliance**: Built-in consent management and automatic data deletion after 3 years
- **Real-time Updates**: Live notifications and data synchronization during shows

### Target Users

- **Ring Secretaries**: Streamlined documentation process with digital forms
- **Judges**: Clear, readable evaluation records and easy review capabilities
- **Show Organizers**: Comprehensive show management and participant tracking
- **Dog Owners**: Professional PDF documentation delivered automatically
- **Kennel Clubs**: Centralized data management and historical archiving

## Tech Stack

### Frontend
- **[Astro 5.5.5](https://astro.build/)** - Modern web framework for fast, content-focused websites with server-side rendering
- **[React 19.0.0](https://react.dev/)** - UI library for building interactive components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript for better development experience
- **[Tailwind CSS 4.0.17](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible and customizable React components

### Backend & Services
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL database, authentication, and real-time subscriptions
- **[Resend](https://resend.com/)** - High-deliverability email service for automated communications
- **[React-PDF](https://react-pdf.org/)** - Client-side PDF generation for dog descriptions

### DevOps & Infrastructure
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automation and deployment
- **[Docker](https://www.docker.com/)** - Containerization for consistent development and deployment
- **[DigitalOcean](https://www.digitalocean.com/)** - Cloud hosting platform

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and quality assurance
- **[Prettier](https://prettier.io/)** - Code formatting for consistency
- **[Husky](https://typicode.github.io/husky/)** - Git hooks for pre-commit checks

## Getting Started Locally

### Prerequisites

- **Node.js** v22.14.0 or higher
- **npm** (comes with Node.js)
- **Git** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/przeprogramowani/10x-dog-show.git
   cd 10x-dog-show
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root with your Supabase and Resend credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Automatically fix ESLint issues |
| `npm run format` | Format code using Prettier |

## Project Scope

### MVP Features (Current Phase)
- ✅ **User Authentication**: Registration, login, and role-based access control
- ✅ **Show Management**: Create, edit, and delete dog shows with templates
- ✅ **Dog Registration**: Add, edit, and manage dog and owner information
- ✅ **Digital Documentation**: Create and edit dog descriptions with time restrictions
- ✅ **Evaluation System**: Configurable sets of evaluations, titles, and placements
- ✅ **PDF Generation**: Automatic creation of professional dog descriptions
- ✅ **Email Delivery**: Automated sending of PDFs to dog owners
- ✅ **GDPR Compliance**: Consent management and data retention policies

### Future Enhancements
- 🔄 **Voice-to-Text Integration**: Speech recognition for hands-free documentation
- 🔄 **Mobile Application**: Native mobile app for on-the-go access
- 🔄 **Offline Mode**: Local data storage for unreliable internet connections
- 🔄 **Advanced Analytics**: Comprehensive reporting and statistics
- 🔄 **External Integrations**: API connections with kennel club systems
- 🔄 **Real-time Collaboration**: Multi-user simultaneous documentation

## Project Status

**Current Version**: 0.0.1  
**Development Phase**: MVP Development  
**Status**: Active Development

### Development Timeline
- **Phase 1**: Core MVP functionality (In Progress)
- **Phase 2**: Advanced features and optimization
- **Phase 3**: Scaling and performance improvements

### Success Metrics
- **10% faster** documentation creation by ring secretaries
- **2 pages saved** per dog per show (paper reduction)
- **100% elimination** of readability errors
- **Full GDPR compliance** with zero violations
- **High adoption rate** among ring secretaries

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contributing

We welcome contributions! Please read our contributing guidelines and ensure your code follows the project's coding standards and AI development practices.

## Support

For support, questions, or feature requests, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

Special thanks to the dog show community for providing valuable insights and feedback during the development process.
