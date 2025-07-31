# Project Lightspeed

A modern, feature-rich note-taking and task management application built with React.

## Features

- 📝 **Rich Note Taking**: Create and organize notes with markdown formatting support
- ✅ **Task Management**: Create todos with priorities, due dates, and subtasks
- 📁 **Hierarchical Organization**: Organize content with nested tabs and folders
- 🌙 **Dark/Light Mode**: Toggle between dark and light themes
- 🔍 **Search & Filter**: Quickly find notes and todos with real-time search
- 📅 **Calendar View**: View todos by due date in calendar format
- 🗑️ **Recycle Bin**: Safely delete and restore items
- 💾 **Data Export/Import**: Backup and restore your data
- ⭐ **Quick Access**: Pin important items for easy access
- 🎨 **Customizable**: Color-coded tabs and customizable icons

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-lightspeed
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Building for Production

To create a production build:

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Automatic Deployment** (Recommended):
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically build and deploy your app

2. **Manual Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Build Configuration**:
   - The project includes a `vercel.json` configuration file
   - Build command: `npm run build`
   - Output directory: `build`

### Other Deployment Options

- **Netlify**: Drag and drop the `build` folder to Netlify
- **GitHub Pages**: Use `npm run build` and deploy the `build` folder
- **Firebase Hosting**: Use Firebase CLI to deploy the `build` folder

## Project Structure

```
src/
├── components/
│   └── ProjectLightspeed.js    # Main application component
├── App.js                      # App wrapper
├── index.js                    # Entry point
└── index.css                   # Global styles

public/
├── index.html                  # HTML template
└── manifest.json              # PWA manifest

build/                          # Production build (generated)
```

## Technologies Used

- **React** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and side effects
- **Local Storage** - Data persistence
- **Vercel** - Deployment platform

## Features Overview

### Note Management
- Create rich text notes with markdown support
- Template system for common note types (meetings, standups, bug reports)
- Real-time search and filtering
- Drag and drop organization

### Task Management
- Create todos with priorities and due dates
- Subtask support for complex tasks
- Calendar integration for due date visualization
- Bulk operations for managing multiple items

### Organization
- Hierarchical tab system with drag-and-drop nesting
- Color-coded organization
- Custom icons and metadata
- Quick access pinning

### Data Management
- Automatic local storage persistence
- Export/import functionality for backups
- Recycle bin with restore capability
- Real-time save indicators

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
