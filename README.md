# Ejam Kopā! 🇱🇻

> **"Let's Go Together!"** - A Latvian community platform connecting people through in-person groups and events

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-v8-339af0?style=flat-square)](https://mantine.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

## 🌟 Mission

Create a portal for connecting like-minded people through **in-person groups and events**, focusing on building genuine friendships and community connections. Whether you're looking for a workout partner, want to join a folk dancing group, or planning a community picnic, Ejam Kopā helps you find your people.

**Not a dating app** - We're all about platonic connections, shared hobbies, and building strong local communities.

## ✨ Key Features

### 🎯 Smart Discovery with 3-Level Categorization
Navigate through our intuitive hierarchical tag system:
- **Level 1**: 6 broad categories (Skill & Craft, Movement & Wellness, Gathering & Fun, etc.)
- **Level 2**: Domains (Team Sports, Visual Arts, Social Meetups)
- **Level 3**: Specific interests (Basketball, Folk Dancing, Yoga)

**Smart Filtering**: Select filters on Groups page → automatically applies to Activities page for seamless exploration.

### 👥 Group Management
- Create **PUBLIC**, **PRIVATE**, or **SINGLE_EVENT** groups
- Application system with approval workflow
- Member management and activity tracking
- Rich group profiles with tags and location

### 📅 Event System
- Create events with full calendar integration
- RSVP tracking and attendance management
- Multiple calendar views (Month, Week, Day, Agenda)
- **Smart event filtering** by category, location, and tags
- Dynamic hour ranges for late-night events

### 🎨 Beautiful Mobile-First Design
- **Bottom Navigation** - 5-tab layout for easy thumb navigation
- **Touch-optimized** forms with 44-48px touch targets
- **SearchOverlay** - Full-screen hierarchical filtering
- **Loading Skeletons** - Smooth loading states for better perceived performance
- **Image Optimization** - Next.js Image with lazy loading and responsive sizes
- **Dark Mode** - Full support with vibrant Coolors palette
- **Responsive** - Seamless experience from phone to desktop

### ✨ Stories (Impact Sharing)
Share positive community impact and inspiring stories. Celebrates the difference our community makes together.

### 🔐 Role-Based Access Control
- **USER** - Create groups, join activities
- **MODERATOR** - Approve tags, manage content
- **COMPANY** - Premium features (coming soon)
- **ADMIN** - Full platform control

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) with TypeScript
- **UI Library**: Mantine v8 with custom Coolors theme
- **State Management**: Zustand with localStorage persistence
- **Calendar**: react-lightweight-calendar (forked with dart-sass)
- **Icons**: Tabler Icons React

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma with PostgreSQL
- **Authentication**: NextAuth.js v4
- **Authorization**: Role-based access control (RBAC)

### Infrastructure
- **Database**: PostgreSQL 16 (Docker)
- **Deployment**: Docker Compose with hot-reload
- **Development**: Hot module replacement, auto-migrations

## 📦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lopinsh/Claude-community.git
   cd Claude-community
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Start with Docker** (Recommended)
   ```bash
   docker-compose up
   ```
   This automatically:
   - Starts PostgreSQL database
   - Runs database migrations
   - Seeds initial data
   - Starts Next.js dev server on http://localhost:3000

4. **Access the application**
   - **App**: http://localhost:3000
   - **Prisma Studio**: http://localhost:5555 (run `npm run db:studio`)

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

- **Admin Email**: `ofeldmanis@gmail.com`
- **Admin Password**: `123456`

## 🛠️ Development

### Docker Commands
```bash
# Start the entire stack
docker-compose up

# Restart app after package.json changes
docker-compose restart app

# View logs
docker-compose logs app --tail=100 --follow

# Stop all containers
docker-compose down

# Access Prisma Studio (database GUI)
npm run db:studio
```

### Database Operations
```bash
# Create a new migration
docker-compose exec app npx prisma migrate dev --name your_migration_name

# Generate Prisma client
docker-compose exec app npx prisma generate

# Seed the database
npm run db:seed

# Reset database (WARNING: destroys all data)
docker-compose exec app npx prisma migrate reset
```

### Local Development (Non-Docker)
```bash
npm install
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 🎨 Color System

We use a vibrant **Coolors palette** for our category system:

- **categoryRed** (#F94144) - Alerts & Important Actions
- **categoryOrange** (#F3722C) - Civic & Governance
- **categoryPeach** (#F9844A) - Gathering & Fun
- **categoryYellow** (#F9C74F) - Practical & Resource
- **categoryGreen** (#90BE6D) - Movement & Wellness
- **categoryTeal** (#43AA8B) - Skill & Craft
- **categoryBlue** (#577590) - Performance & Spectacle
- **categoryDarkBlue** (#277DA1) - Accents

Each color has 10 shades [0-9] for light/dark mode variations.

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Development setup, architecture, and commands
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Mission, features, and vision
- **[MOBILE_FIRST_STATUS.md](./MOBILE_FIRST_STATUS.md)** - Mobile optimization progress (75% complete)
- **[STRATEGIC_BACKLOG.md](./STRATEGIC_BACKLOG.md)** - Future features and strategic planning
- **[TYPOGRAPHY_GUIDE.md](./TYPOGRAPHY_GUIDE.md)** - Component usage patterns
- **[ROLE_SYSTEM_IMPLEMENTATION.md](./ROLE_SYSTEM_IMPLEMENTATION.md)** - RBAC documentation

## 🌍 Regional Focus

**Primary Market**: Latvia 🇱🇻

Tailored for Latvian community activities:
- **Choirs** - Strong choral tradition
- **Folk Dancing** - Cultural heritage groups
- **Sports Clubs** - Team and individual activities
- **Community Events** - Local gatherings and workshops

**Language**: Currently English, with potential for Latvian localization.

## 🎯 Use Cases

### Group Creator
> "I run a folk dance group and need 3 more dancers for our ensemble"

### Activity Seeker
> "I want to find a workout partner in Riga who shares my fitness goals"

### Event Organizer
> "I'm hosting a community picnic next Saturday and want to invite locals"

### Interest Explorer
> "I want to discover groups in my area that match my hobbies"

## 🚧 Current Status

### ✅ Completed Features
- User authentication and profiles
- Group creation and management
- Event system with calendar views
- 3-level hierarchical tag system
- Smart filtering with persistence
- Notification system
- **Mobile-first responsive design (75% complete)**
  - ✅ Bottom navigation & global layout
  - ✅ Touch-optimized forms (44-48px targets)
  - ✅ Full-screen modals on mobile
  - ✅ Profile, Group Detail, Event Detail pages optimized
  - ✅ Loading skeletons for better UX
  - ✅ Image optimization with Next.js Image
  - ✅ Responsive images with lazy loading
- Role-based access control (RBAC)
- Admin dashboard and moderation tools
- Stories section for impact sharing

### 🚀 In Progress
- **Performance optimization** (Lighthouse audit, code splitting)
- **Calendar enhancements** (touch-friendly controls, swipe gestures)
- Advanced search capabilities
- Email notifications
- Group messaging system

### 📋 Roadmap

#### Short-term (Next Sprint)
- Complete mobile-first Phase 6-7 (Calendar, Notifications, Performance)
- Date range filtering for Activities page
- Group count display in Explore page
- Role-based views (member/visitor/moderator)

#### Medium-term
- **Phase 1**: Location-based recommendations
- **Phase 2**: Business monetization (premium listings)
- **Phase 3**: Advanced analytics and insights
- **Phase 4**: Latvian language support

#### Long-term
- Progressive Web App (PWA) features
- Offline support
- Push notifications

For detailed mobile optimization progress, see [MOBILE_FIRST_STATUS.md](./MOBILE_FIRST_STATUS.md).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code patterns (see `CLAUDE.md`)
- Use Mantine components (no custom CSS)
- Maintain mobile-first approach
- Test on both light and dark modes
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI powered by [Mantine](https://mantine.dev/)
- Calendar by [react-lightweight-calendar](https://github.com/Jackyef/react-lightweight-calendar)
- Icons from [Tabler Icons](https://tabler-icons.io/)
- Color palette from [Coolors](https://coolors.co/)

## 📞 Contact

**Project Maintainer**: Oskars Feldmanis
- Email: ofeldmanis@gmail.com
- GitHub: [@lopinsh](https://github.com/lopinsh)

---

<div align="center">
  <strong>Made with ❤️ for the Latvian community</strong>
  <br>
  <sub>Connecting people through shared interests and activities</sub>
</div>
