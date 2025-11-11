# SoftDev Solutions - Software Services Website

A modern, responsive website built with Next.js and React for SoftDev Solutions, a software development company offering comprehensive technology services.

## Features

- **Modern Design**: Clean, professional design with Tailwind CSS
- **Responsive Layout**: Fully responsive design that works on all devices
- **Interactive Components**: Dynamic navigation, contact forms, and interactive elements
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Fast Performance**: Built with Next.js for optimal performance

## Pages

- **Home**: Hero section, services overview, company highlights, and call-to-action
- **Services**: Detailed service offerings with feature lists and development process
- **About**: Company story, team information, core values, and statistics
- **Contact**: Contact form, business information, and response time details

## Services Offered

1. **Web Development** - Custom web applications with modern technologies
2. **Mobile App Development** - Native and cross-platform mobile applications
3. **Cloud Solutions** - Scalable cloud infrastructure and migration services
4. **Technology Consulting** - Strategic technology consulting and digital transformation
5. **E-commerce Solutions** - Complete e-commerce platforms with payment integration
6. **Support & Maintenance** - Ongoing support and maintenance services

## Technologies Used

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **ESLint** - Code linting and formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd software-services-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── contact/
│   │   └── page.tsx          # Contact page
│   ├── services/
│   │   └── page.tsx          # Services page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
└── components/
    ├── Header.tsx            # Navigation header
    └── Footer.tsx            # Site footer
```

## Customization

### Company Information
- Update company name, contact details, and descriptions in the respective page components
- Modify the color scheme by updating Tailwind classes throughout the components
- Replace placeholder team member information with actual team details

### Content Updates
- Services can be modified in the services page component
- Team information can be updated in the about page
- Contact information can be changed in the footer and contact page

### Styling
- The website uses Tailwind CSS for styling
- Color scheme is primarily blue-based but can be easily customized
- All components are responsive and mobile-friendly

## Deployment

The website can be deployed to various platforms:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Traditional hosting** with static export

For Vercel deployment:
```bash
npm install -g vercel
vercel
```

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or create an issue in the repository.