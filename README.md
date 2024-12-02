# Thank-A-Teacher

Team 4115

This application allows for undergraduate students to send thank you cards to TAs in the College of Computing.

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
- Resolved teacher dashboards displaying incorrect class information.
- Fixed login page redirects when incorrect credentials were provided.

## Known Bugs
- Occasional delay in loading the login page under high database load conditions.
- Image hosting link loads slowly under high traffic.
- Card templates flicker and take time to load when rapidly switching between tabs.
- Teacher’s manage classes page crashes when adding a student without any created classes.
