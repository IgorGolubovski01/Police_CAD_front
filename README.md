# Police CAD Frontend

This is an **Angular-based frontend application** for the Incident Management System. It provides a user-friendly interface for dispatchers and units to manage and track incidents in real-time, with interactive map-based visualization powered by Leaflet.

## Features

### Core Functionalities:

- **User Authentication**: Secure login system with role-based access control (Admin, Dispatcher, Unit).
- **Incident Management**: Create, view, and track incidents with real-time location mapping.
- **Real-Time Location Tracking**: Display unit locations dynamically on an interactive map.
- **Interactive Maps**: Leaflet-based map showing:
  - Unit markers with car icons
  - Incident markers with red icons
  - Popups with detailed information
  - Tooltips for quick identification
- **Role-Based Dashboards**:
  - **Admin Page**: Administrative controls (future expansion).
  - **Dispatcher Page**: Create incidents, assign units, manage emergency responses.
  - **Unit Page**: View map with all incidents and units, continuous location updates.
- **Responsive UI**: Built with Angular Material for a modern user experience.

### Core Components:

1. **Pages**:
   - `HomeComponent`: Login page for user authentication.
   - `AdminPageComponent`: Administrative dashboard.
   - `DispatcherPageComponent`: Dispatcher operations with incident creation form.
   - `UnitPageComponent`: Unit view with map and location tracking.

2. **Services**:
   - `UserService`: Handles authentication, login, and user session management with Basic Auth.
   - `DispatcherService`: Manages incident creation and retrieval from backend.
   - `UnitService`: Manages unit data and location updates.
   - `LocationService`: Retrieves current GPS location from the browser.

3. **Models**:
   - `LoginModel`: User login credentials.
   - `IncidentModel`: Incident data structure for creation.
   - `GetAllIncidentsDto`: DTO for incident data from backend.
   - `LatLonModel`: Latitude/Longitude data structure.
   - `UnitModel`: Unit data structure.

4. **Styling**:
   - CSS modules for component-specific styles.
   - Global styles for consistent theming.
   - Responsive design supporting various screen sizes.

## Tech Stack

- **Frontend Framework**: Angular 19.
- **UI Library**: Angular Material.
- **Map Visualization**: Leaflet with TypeScript typings.
- **HTTP Client**: Axios for API communication.
- **State Management**: Component-based state with services.
- **Language**: TypeScript 5.7+.
- **Build Tool**: Angular CLI 19.
- **Testing**: Jasmine and Karma (configured).
- **Node Package Manager**: npm/bun.
