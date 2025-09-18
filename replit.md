# Factory KPI Dashboard

## Overview

This is a Factory KPI Dashboard application built to track and manage key performance indicators across four main departments: Safety, Quality, Production, and Logistics. The system provides real-time monitoring of departmental metrics, action item management, and activity logging with role-based authentication and authorization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts library for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with in-memory storage (development) and PostgreSQL storage (production)
- **Authentication**: Session-based authentication with role-based access control
- **API Design**: RESTful API endpoints with consistent error handling and logging

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Four main tables - users, kpiData, actionItems, and activityLogs
- **Development Storage**: In-memory storage implementation with default seed data
- **Production Storage**: PostgreSQL with Neon Database serverless connection

### Authentication & Authorization
- **Authentication Method**: Username/password with server-side sessions
- **Role-Based Access**: Four department roles (Safety, Quality, Production, Logistics) plus Admin
- **Session Security**: HTTP-only cookies with configurable secure settings
- **Permission System**: JSON-based permissions array for fine-grained access control

### Key Features
- **Real-time KPI Monitoring**: Automatic data refresh every 30 seconds for KPI data
- **Action Item Management**: Create, edit, delete, and assign action items with priority levels
- **Activity Logging**: Comprehensive logging of user actions and system events
- **Multi-language Support**: Turkish language interface for factory workers
- **Responsive Design**: Mobile-friendly interface with touch-optimized controls
- **Data Entry Forms**: Department-specific forms with validation and metadata collection

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and database toolkit
- **express & express-session**: Web framework and session management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form & @hookform/resolvers**: Form handling and validation
- **zod & drizzle-zod**: Schema validation and type inference

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority & clsx**: Dynamic class name generation
- **lucide-react**: Icon library
- **recharts**: Charting library for data visualization

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

### Replit-specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Runtime error handling in development
- **@replit/vite-plugin-cartographer**: Code navigation and mapping
- **@replit/vite-plugin-dev-banner**: Development environment indicators