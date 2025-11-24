# HealthCare+ Management System

A comprehensive chronic disease management platform built with React, TypeScript, and Firebase.

## 🚀 Features

- **Patient Dashboard** - Track medications, symptoms, and appointments
- **Health Metrics** - Monitor vital signs and health data
- **Medication Management** - Set reminders and track adherence
- **Symptom Tracking** - Log and analyze symptoms over time
- **Appointment Scheduling** - Book and manage healthcare appointments
- **Secure Authentication** - Firebase-based user authentication
- **Offline Support** - Works offline with automatic sync
- **Performance Optimized** - Fast load times with code splitting and lazy loading

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Build Tool:** Vite
- **Deployment:** Vercel
- **State Management:** React Hooks
- **Form Handling:** React Hook Form + Yup validation
- **Routing:** React Router v7

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/shriramrajat/HealthCare.git

# Navigate to project directory
cd HealthCare

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Firebase credentials to .env file

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_ENV=development
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_ERROR_LOGGING=true
VITE_CACHE_TTL=300000
VITE_API_TIMEOUT=10000
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically deploy on every push to the main branch.

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy using Vercel CLI
npm run deploy:vercel
```

## 📊 Performance

- **Load Time:** < 3 seconds (3G connection)
- **Lighthouse Score:** 95+
- **Bundle Size:** < 500 KB per chunk
- **Time to Interactive:** < 5 seconds

## 🔒 Security

- Firebase Authentication with email/password
- Firestore security rules for data protection
- Environment variables for sensitive data
- HTTPS enforced on all connections
- Security headers configured

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Rajat Shriram - [GitHub](https://github.com/shriramrajat)

## 🙏 Acknowledgments

- Firebase for backend services
- Vercel for hosting
- React team for the amazing framework
- All contributors and users

---

**Built with ❤️ for better healthcare management**
