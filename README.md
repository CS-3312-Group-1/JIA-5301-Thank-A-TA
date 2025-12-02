# Thank-A-Teacher

This application allows for undergraduate students to send thank you cards to TAs in the College of Computing.

## Features

### Version 2.0 Features

#### Enhanced Student Features

**Advanced TA Selection**
- **Multi-Semester Support:** View TAs across multiple active semesters
- **Advanced Filtering:** Filter TAs by class, name, and enabled semesters

**Email Notifications**
- **Automated TA Notifications:** TAs automatically receive email alerts when they get a new card with sender information and direct link to view

#### Enhanced TA Features

**Advanced Filtering & Organization**
- **Date Sorting:** Sort cards by oldest first (ascending) or newest first (descending)
- **Reset Filters:** Quickly clear all filters to view all cards
- **Session Caching:** Improved performance with client-side card caching

#### Enhanced Admin Features

**Authentication & Security**
- **SSO Authentication:** All users (students, TAs, admins) log in via Georgia Tech Single Sign-On (SSO/CAS)
- **Automatic Account Creation:** First-time SSO login automatically creates an account using Georgia Tech email
- **Automatic TA Detection:** System automatically identifies if a user is a registered TA by checking their email against the TA list
- **Role Assignment:** Accounts are automatically designated as student or TA based on TA list matching
- **Manual Admin Assignment:** Admin privileges (isAdmin: true) must be set manually in the database

**Advanced GIF Management**
- **GIF Preview:** Preview GIFs before confirming upload
- **Confirmation Modals:** Prevents accidental deletions with confirmation dialogs
- **Enhanced Gallery:** Track GIF metadata (name, size, upload date)

**TA Management System**
- **Bulk Upload via CSV:**
  - Drag-and-drop CSV file upload interface
  - CSV format validation
  - Automatic parsing of TA information (FirstName, LastName, Email, Class, Semester)
  - Duplicate prevention (same email per semester)
- **Semester Management:**
  - View all uploaded semesters
  - Enable/disable specific semesters for student visibility
  - Delete entire semesters and all associated TA data
  - Track CSV filename reference for each semester
  - Visual indicators for enabled/disabled status
- **Individual TA Management Modal:**
  - View all TAs for a specific semester in a table format
  - Add individual TAs manually (personal add)
  - Edit TA information (name, email address, class/course assignment)
  - Delete individual TAs
  - Real-time table updates after changes
  - Search functionality within TA lists
- **Data Integrity:**
  - Prevent duplicate TA entries within the same semester
  - Automatic cleanup when deleting semesters
  - Validation for email format and required fields

#### Technical Enhancements From Version 1.0

**Database Migration**
- **MariaDB Database:** Migrated from MongoDB to MariaDB for GaTech Plesk usage
- **Improved Schema Design:** Enhanced data models for cards, TAs, semesters, users, and gifs to handle new SQL

**Email System**
- **Email Integration:** Nodemailer integration for automated email notifications
- **Sendmail Transport:** Server-side email delivery system
- **HTML Email Templates:** Rich-formatted email notifications
- **Customizable Email Content:** Dynamic email generation with sender information

**Architecture Improvements**
- **Application Refactoring:** Restructured codebase for better maintainability
- **Deployment Configuration:** Added Plesk deployment support and documentation
- **API Optimization:** Improved endpoint structure and error handling
- **Session Enhancement:** Enhanced session management with express-session

**Security Enhancements**
- **SSO/CAS Integration:** Exclusive use of Georgia Tech Central Authentication Service (CAS) for all logins
- **Automatic Email Verification:** Georgia Tech email addresses verified through SSO
- **Role-Based Access Control:** Automatic role assignment for students and TAs; manual assignment for admins
- **Database-Driven Permissions:** User roles (isTA, isAdmin) stored and verified in database

---

### Core Technical Stack

#### Security
- **Authentication:** SSO/CAS
- **Session Management:** Express-session for server-side session handling
- **Role-Based Access Control:** Separate permissions for students, TAs, and admins

#### Performance
- **Session-Based Caching:** Client-side caching for improved load times (Version 2.0)
- **Optimized Image Handling:** Efficient base64 encoding/decoding

#### Data Management
- **Database:** MariaDB
- **File Upload Handling:** Middleware for CSV and GIF uploads
- **Memory Storage:** In-memory file processing before database storage

#### Frontend Technology
- **React Framework:** Modern component-based UI architecture

## Bug Fixes 

### Bug Fixes From Previous Release 
- Several UI inconsistencies were removed. Buttons and layouts were streamlined.
- Fixed rasterization issues where selection boxes were incorrectly being displayed on cards sent to TAs.
- Previously, card templates flickered if switched between.
- Updated issues with email template to TAs (lack of hyperlink to site, formatting, etc.) 

### Bug Fixes From Current Release
- Fixed issue with dynamic sizing where on displays bigger than a standard laptop the application would not display properly.
- Previously, admins could upload any duplicate GIF of any size. Duplicate GIFs are no longer permitted and there are minimum and maximum sizes for the GIFs. If a GIF does not fall into these min/max parameters, it is resized.
- Fixed issue where drag and drop was not working for uploading CSV files of TA information.
- Fixed issue where TAs were not being deleted from the database if they were deleted by the admin.
- Made several improvements to unintuitive UI: changed button layouts, added consistency to sizing, etc.
- Added confirmations for uploads and deletions that did not exist previously 
## Known Issues and Bugs
- On thank you cards, font color sometimes does not update properly.
- On thank you cards, moving text can sometimes be bugged or delayed.
- The Sent animation that plays after a student sends a card is delayed (nothing happens for several seconds, making users think that it was not sent). 
---
### Version 1.0 Features

#### Student Features

**Account Management**
- **User Registration:** Create a student account with email and password
- **Login System:** Log in with email and password credentials
- **TA Detection:** System identifies if an account belongs to a registered TA

**TA Selection**
- **TA Browsing:** Browse available TAs
- **Basic Search:** Search for TAs by name or class

**Card Creation & Customization**
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

**Card Delivery & Export**
- **Send to TA:** Deliver the card directly to the selected TA
- **Confirmation Page:** View confirmation after successfully sending a card
- **Export as PNG:** Download your card as a PNG image for personal use or sharing
- **Animated GIF Export:** Cards with GIFs are exported as animated GIF files

#### TA Features

**Account Access**
- **Login System:** TAs log in with their registered email and password
- **Automatic Detection:** Accounts flagged as TA if email is in TA database

**Card Management**
- **Personal Inbox:** View all received thank you cards in a dedicated inbox
- **Card Details:** See sender name and class for each card

**Card Viewing**
- **Modal View:** Click any card to view it in full-screen modal
- **High-Quality Display:** View cards in their original quality
- **Animated GIF Playback:** See all animations and GIFs in received cards

**Basic Filtering**
- **Filter by Class:** View cards from specific classes
- **Filter by Category:** Organize cards by categories

#### Admin Features

**Account Access**
- **Admin Login:** Admin accounts access via email/password
- **Role Protection:** Admin functionality restricted to authorized accounts

**GIF Management**
- **GIF Upload:**
  - Drag-and-drop interface for easy file uploads
  - Click-to-browse file selection
  - GIF format validation
  - 5MB file size limit per GIF
- **GIF Library:**
  - View all uploaded GIFs in a gallery format
  - See GIF names and previews
- **GIF Deletion:**
  - Remove unwanted GIFs from the library
  - Automatic refresh of GIF gallery after deletion

[Old Detailed Design Doc](Design-Document-Final.pdf)

----

## Installation Guide
For information on installing the Thank-A-Teacher Application and troubleshooting: <br/>
[Installation Guide](Installation-Guide.pdf)

## Detailed Design Document 
Review our applications architecture and methodology here: <br/>
[Detailed Design Doc](Final-Updated-Detailed-Design.pdf)
