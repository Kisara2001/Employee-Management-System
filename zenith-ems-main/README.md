# EMS - Employee Management System

A modern, production-ready Employee Management System built with React, TypeScript, and a glass morphism design. Features comprehensive HR management tools with an intuitive dark-themed interface.

## 🚀 Features

- **Authentication System** - JWT-based login with automatic token management
- **Dashboard Analytics** - Real-time KPIs, attendance trends, and payroll insights
- **Employee Management** - Complete CRUD operations with advanced filtering
- **Department & Designation Management** - Organize your company structure
- **Shift Management** - Create and assign work shifts
- **Attendance Tracking** - Daily attendance with check-in/check-out functionality
- **Payroll System** - Salary templates and automated payroll generation
- **Comprehensive Reports** - Detailed analytics and exportable reports
- **Dark Mode** - Beautiful glass morphism design with theme persistence
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   VITE_APP_NAME=EMS
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Backend Integration

This frontend is designed to work with the EMS backend API. The API base URL should be configured in your `.env` file.

### Required Backend Endpoints:

- **Auth**: `/auth/login`, `/auth/me`
- **Users**: `/users` (CRUD operations)
- **Departments**: `/departments` (CRUD operations)
- **Designations**: `/designations` (CRUD operations)
- **Shifts**: `/shifts`, `/employee-shifts` (CRUD operations)
- **Attendance**: `/attendance` (CRUD operations + check-in/out)
- **Payroll**: `/payroll`, `/salary-templates` (CRUD + generation)
- **Reports**: `/reports/*` (various report endpoints)
- **Dashboard**: `/dashboard/*` (analytics endpoints)

## 🎨 Design System

The app features a modern glass morphism design with:

- **Colors**: Deep indigo-violet primary (#7c4dff) with cyan accents (#00d4ff)
- **Typography**: Inter font family for clean readability
- **Effects**: Glass surfaces with backdrop blur and subtle shadows
- **Animations**: Smooth fade/slide transitions throughout the interface
- **Theme**: Dark mode by default with light mode support

## 📁 Project Structure

```
src/
├── app/                 # App shell and layout components
├── components/
│   ├── ui/             # Reusable UI components (shadcn)
│   └── domain/         # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (API, auth, etc.)
├── pages/              # Page components
├── store/              # State management
└── styles/             # Global styles
```

## 🚀 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🔒 Authentication

The app uses JWT-based authentication with automatic token management:

- Tokens are stored in localStorage
- Automatic logout on 401 responses
- Route protection for authenticated pages
- Login redirect for unauthenticated users

## 📱 Responsive Design

The interface is fully responsive with:

- Mobile-first design approach
- Collapsible sidebar for mobile devices
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## 🎯 Demo Credentials

For development/demo purposes:
- **Email**: admin@company.com
- **Password**: password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered React development
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Design inspiration from modern dashboard interfaces