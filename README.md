# Thank-A-Teacher

This application allows for undergraduate students to send thank you cards to TAs in the College of Computing.

## Features

### Student Features

#### Account Management
- **SSO Authentication:** All users log in via Georgia Tech Single Sign-On (SSO/CAS)
- **Automatic Account Creation:** First-time SSO login automatically creates an account using Georgia Tech email
- **Automatic TA Detection:** System automatically identifies if a user is a registered TA by checking their email against the TA list
- **Role Assignment:** Accounts are automatically designated as student or TA based on TA list matching

#### TA Selection
- **TA Search:** Browse and search for TAs from enabled semesters
- **Advanced Filtering:** Filter TAs by:
  - Class/Course name
  - TA name
  - Semester (only enabled semesters are shown)
- **Multi-Semester Support:** View TAs across multiple active semesters

#### Card Creation & Customization
- **Template Selection:** Choose from five unique, professionally-designed card templates
- **Text Customization:**
  - Add multiple draggable text boxes to position text anywhere on the card
  - Select from 9 different font styles (Roboto, Open Sans, Lato, Poppins, Montserrat, Merriweather, Playfair Display, Raleway, Oswald)
  - Adjust text size dynamically (10-100 pt) with real-time preview
  - Choose from 10 preset colors (Rainbow colors, Black, White, Brown)
  - Edit text box properties after placement
  - Delete individual text boxes
- **GIF Integration:**
  - Select from a library of administrator-approved animated GIFs
  - Drag and drop GIFs anywhere on the card
  - Resize and reposition GIFs with ease
  - Add multiple GIFs to a single card
  - Delete individual GIFs from the card
  - Animated GIF support in final card output
- **Real-Time Preview:** See exactly how your card will look before sending
- **Content Moderation:** Built-in profanity filter ensures all messages are appropriate

#### Card Delivery & Export
- **Send to TA:** Deliver the card directly to the selected TA
- **Email Notifications:** TAs automatically receive email alerts when they get a new card
- **Confirmation Page:** View confirmation after successfully sending a card
- **Export as PNG:** Download your card as a PNG image for personal use or sharing
- **Animated GIF Export:** Cards with GIFs are exported as animated GIF files

### TA Features

#### Account Access
- **SSO Authentication:** All TAs log in via Georgia Tech Single Sign-On (SSO/CAS)
- **Automatic TA Role Assignment:** When a user logs in with an email that matches an entry in the TA list, their account is automatically flagged as a TA account (isTA: true)
- **Seamless Access:** No separate registration required - first login automatically creates account with TA privileges if email is in TA list

#### Card Management
- **Personal Inbox:** View all received thank you cards in a dedicated inbox
- **Email Notifications:** Receive instant email alerts when students send cards, including:
  - Sender's name
  - Class information
  - Direct link to view the card
- **Card Details:** See sender name and class for each card

#### Filtering & Organization
- **Class Filter:** Filter cards by specific classes/courses
- **Category Filter:** Organize cards by categories
- **Date Sorting:** Sort cards by:
  - Oldest first (ascending)
  - Newest first (descending)
- **Reset Filters:** Quickly clear all filters to view all cards
- **Session Caching:** Improved performance with client-side card caching

#### Card Viewing
- **Modal View:** Click any card to view it in full-screen modal
- **High-Quality Display:** View cards in their original quality
- **Animated GIF Playback:** See all animations and GIFs in received cards

### Admin Features

#### Account Access
- **SSO Authentication:** Admins log in via Georgia Tech Single Sign-On (SSO/CAS)
- **Manual Admin Assignment:** Admin privileges (isAdmin: true) must be set manually in the database
- **Role-Based Access:** Admin-only functionality protected by authentication and role verification

#### GIF Management
- **GIF Upload:**
  - Drag-and-drop interface for easy file uploads
  - Click-to-browse file selection
  - GIF format validation
  - Preview before confirming upload
  - 5MB file size limit per GIF
- **GIF Library:**
  - View all uploaded GIFs in a gallery format
  - See GIF names and previews
  - Track GIF metadata (name, size, upload date)
- **GIF Deletion:**
  - Remove unwanted GIFs from the library
  - Confirmation modal prevents accidental deletions
  - Automatic refresh of GIF gallery after deletion

#### TA Management
- **Bulk Upload via CSV:**
  - Drag-and-drop CSV file upload interface
  - Click-to-browse file selection
  - CSV format validation
  - Automatic parsing of TA information (FirstName, LastName, Email, Class, Semester)
  - Duplicate prevention (same email per semester)
  - UTF-8 and BOM support for international characters
- **Semester Management:**
  - View all uploaded semesters
  - Enable/disable specific semesters for student visibility
  - Delete entire semesters and all associated TA data
  - Track CSV filename reference for each semester
  - Visual indicators for enabled/disabled status
- **Individual TA Management:**
  - View all TAs for a specific semester in a table format
  - Add individual TAs manually (personal add)
  - Edit TA information:
    - Name
    - Email address
    - Class/Course assignment
  - Delete individual TAs
  - Real-time table updates after changes
- **Data Integrity:**
  - Prevent duplicate TA entries within the same semester
  - Automatic cleanup when deleting semesters
  - Validation for email format and required fields

### Technical Features

#### Security
- **SSO/CAS Authentication:** Exclusive use of Georgia Tech Central Authentication Service (CAS) for all logins
- **Session Management:** Express-session for server-side session handling
- **Automatic Email Verification:** Georgia Tech email addresses verified through SSO
- **JWT Tokens:** Secure token-based session management after SSO authentication
- **Role-Based Access Control:** Automatic role assignment for students and TAs; manual assignment for admins
- **Database-Driven Permissions:** User roles (isTA, isAdmin) stored and verified in database

#### Performance
- **Session-Based Caching:** Client-side caching for improved load times
- **Optimized Image Handling:** Efficient base64 encoding/decoding
- **Lazy Loading:** Dynamic GIF loading for better performance
- **Database Indexing:** Optimized queries for fast data retrieval

#### Data Management
- **MongoDB Database:** NoSQL database for flexible data storage
- **Mongoose ODM:** Object Data Modeling for structured data validation
- **File Upload Handling:** Multer middleware for CSV and GIF uploads
- **Memory Storage:** In-memory file processing before database storage

#### Communication
- **Email System:** Nodemailer integration for automated email notifications
- **Sendmail Transport:** Server-side email delivery
- **HTML Email Templates:** Rich-formatted email notifications
- **Customizable Email Content:** Dynamic email generation with sender information

#### Frontend Technology
- **React Framework:** Modern component-based UI architecture
- **React Router:** Client-side routing for seamless navigation
- **Context API:** Global state management for user authentication
- **React Hooks:** useState, useEffect, useCallback for state management
- **Responsive Design:** Mobile-friendly interface

#### Content Processing
- **HTML to Canvas:** html2canvas for card rendering
- **GIF Encoding:** Custom GIF encoder for animated card exports
- **Base64 Encoding:** Efficient image data transmission
- **Drag & Drop:** React-draggable for intuitive card editing
- **CSV Parsing:** csv-parser for bulk TA data imports
- **Profanity Filtering:** bad-words library for content moderation

#### Development Features
- **Environment Configuration:** dotenv for secure configuration management
- **CORS Support:** Cross-origin resource sharing enabled
- **Hot Reloading:** Nodemon for development server auto-restart
- **Build System:** Production-ready build process
- **Static File Serving:** Express static file middleware
    
## Known Issues and Bugs

## Installation Guide
For information on installing the Thank-A-Teacher Application and troubleshooting: <br/>
[Installation Guide](Installation-Guide.pdf)

## Detailed Design Document 
Review our applications architecture and methodology here: <br/>
[Detailed Design Doc](Design-Document-Final.pdf)