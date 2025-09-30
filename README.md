# Thank-A-Teacher

This application allows for undergraduate students to send thank you cards to TAs in the College of Computing.

# Release Notes Section

## Release Notes - Version 1.1.0

### Features
- A login page for all three user types (student, TA, admin)
- Ability to login to existing account or, if no account exists, create an account
- Separate account creation screen
- Student home page where students can select TA from dropdown menus. Students are able to filter by class and then TA name, and will see the TA's email.
- Five separate card templates students can pick from.
- Students can add customizable text (text is customizable via font, font size, font color) to the card with message for TA
- Students can add GIFs to the card as decoration
- Students can send card to TA or export card
- Once student sends card, confirmation is provided, and a Sent! screen is visible to students. Student can then send another card or log out.
- TAs receive email notification when a new card is sent
- TAs are able to view all cards within the application that have been sent by students
- Created admin interface if user logs in with admin account 
- Admins are able to upload new GIFs via drag and drop or file upload
- Admins are able to delete previously uploaded GIFs
- Admins are able to upload CSV files containing TA information. If TA is duplicate, they will not be added twice. 
- Admins are able to delete pre-existing TA CSV files.
    
### Bug Fixes
- TA is able to see which student cards are from 
- Home button on TA interface no longer takes TA to student view
- Confirmation message added when sending card
- Added functionality to export button on card creation screen
### Known Issues
- If card is sent while text is currently selected, blue text selection box appears on card received by TA
- No confirmation popup for deletion of GIFs/CSVs on admin page, so admins may accidentally delete files with no way to recover them
- Admin interface UI needs to have padding between upload file button and drag and drop file on GIF upload section
- Email notifications to TAs should contain actual hyperlink to site 
- Admin can currently only delete GIFs uploaded by admin, not the inital GIFs that are part of the application. Admin should be able to modify all GIFs.
- Delete button for GIFs on admin interface are not consistently positioned.
- Admin can currently upload two GIFs with the same name, which should not be allowed.
- Delete button readability is poor. White text on red background has poor contrast and is hard to read. 
- No drag and drop option for CSV file upload.
- Lack of upload confirmation with CSV files. 
# Release Notes - Version 1.0

## New Features
- Added a login page allowing users and TAs to access their accounts.
- Created TA inbox page to display all cards for TAs.
- Implemented TA card display, enabling TAs to view task cards on the TA page.
- Added full-screen card view for TAs to view cards in a larger format on the TA page.
- Updated database for User/TA login and integrated secure authentication functionality.
- Implemented email functionalit that directs recipients to the card page.
- Created a feature to send cards to email inboxes when the 'send' button is clicked.
- Enhanced the UI for the card design page to make the interface more intuitive and visually appealing.
- Enabled exporting of card images for users to save the completed card locally.
- Created a base page for card editing that contains the selected card with movable and interactive text boxes.
- Developed card design customization including buttons for changing text color and size.
- Added navigation and discard popups for students to manage their card design efficiently.
- Created 5 card templates to give users more choices for thank-you cards.
- Implemented catalog filtering and navigation system for smooth multi-page navigation.
- Added preview pop-up feature for card templates to view them before selection.
- Introduced GIF options on the card design page.
- Improved admin interface with new views for managing GIF availability.
- Added color enhancements for the sent card page for better visual appeal.

## Bug Fixes
- Resolved minor UI inconsistencies on login and TA inbox pages.
- Fixed routing issues between back and home buttons.
- Improved card export feature to ensure faster performance.
- Resolved issues with card images loading inconsistently due to database delays.
- Fixed incorrect rendering of progress bars in the dashboard.
- Fixed alignment issues in the catalog UI and navigation responsiveness.
- Fixed login page redirects when incorrect credentials were provided.

## Known Bugs
- Occasional delay in loading the login page under high database load conditions.
- Image hosting link loads slowly under high traffic.
- Card templates flicker and take time to load when rapidly switching between tabs.


## Installation Guide
For information on installing the Thank-A-Teacher Application and troubleshooting: <br/>
[Installation Guide](Installation-Guide.pdf)

## Detailed Design Document 
Review our applications architecture and methodology here: <br/>
[Detailed Design Doc](Design-Document-Final.pdf)
