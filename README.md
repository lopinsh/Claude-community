# Ejam Kopā! 🇱🇻

> **"Let's Go Together!"** - A Latvian community platform connecting people through in-person groups and events

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-v8-339af0?style=flat-square)](https://mantine.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

## 🌟 Mission

Create a portal for connecting like-minded people through **in-person groups and events**, focusing on building genuine friendships and community connections. Whether you're looking for a workout partner, want to join a folk dancing group, or planning a community picnic, Ejam Kopā helps you find your people, form connections through activties, shared hobbies, and building strong local communities.

## ✨ Key Features

### 🎯 Smart Discovery with 3-Level Categorization
Navigate through our intuitive hierarchical tag system:
- **Level 1**: 6 broad categories (Community & Society, Gathering & Fun, Movement & Wellness, Performance & Spectacle, Practical & Resource, Skill & Craft.)
- **Level 2**: Domains (Team Sports, Visual Arts, Social Meetups)
- **Level 3**: Specific interests (Basketball, Folk Dancing, Yoga)

### ✨ Stories (Impact Sharing)
Share positive community impact and inspiring stories. Celebrates the difference our community makes together.


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
