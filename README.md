# Thank-A-Teacher

Team 4115
This application allows for undergraduate students to send thank you cards to TAs in the College of Computing.

# Release Notes 
# Version 0.3.0
### New Features
- Implemented functionality to send the card to an email inbox when the 'send' button is clicked.
- Email sent by the student includes a link to view the image of the card.
- Enabled sending of card data to the database.
- Added a popup that asks users to confirm before sending a card.
- Created a database to store cards.
- Enhanced the UI for the card design page to make the interface more intuitive and visually appealing.
- Enabled exporting of the card image for users to save the completed card locally.
- Updated the base text color for each page to maintain a consistent design aesthetic.
- Added animation and page feedback to indicate that a card has been sent.
### Bug Fixes
- Resolved minor UI inconsistencies to enhance the overall user experience.
- Improved the responsiveness of the 'send' feature to ensure cards are delivered to email inboxes without delay.
### Known Bugs
- Image hosting link occasionally loads slowly when there is high traffic.

# Version 0.2.0
### New Features
- Created a base page for card editing that contains the selected card.
- Added movable and interactive text boxes for cards.
- Imported base cards without hardcoded text.
- Created a button for changing the color of text.
- Created a button for changing the size of text.
- Added navigation from the card homepage to the design page.
- Added navigation and a popup for students to discard the current card.
- Final styling changes for the card homepage to enhance the overall look and feel of the card selection and editing process.
### Bug Fixes
- Addressed several styling and interactive bugs to ensure a smoother and more intuitive card customization experience.
- Improved the stability of the navigation system to minimize delays when moving between pages.
### Known Bugs
- Card templates temporarily flickers and takes some time to load in when quickly swapping between pages. 
  
# Version 0.1.0
### New Features
- Created 5 card templates to give users more choices when sending thank you cards.
- Created a catalog page that will house the various card templates.
- Integrated the 5 card templates into the overall catalog UI.
- Implemented a smooth multi-page navigation system that makes it simple for users to navigate between pages using next buttons and home buttons.
- Created and implemented a catalog filtering system that lets users choose and view cards according to various categories.
- Added a preview pop-up feature so users can view card templates before selecting them.
### Bug Fixes
- Fixed routing between the back and home buttons to bring you to the correct page.
- Fixed filter functionality not properly displaying correct set of cards for the selected category.
- Fixed card templates not properly scaled in catalog ui.
- Fixed layout issue with cards causing filter interface to be misaligned.
### Known Bugs
- Back and home buttons have a slight delay when quickly navigating between pages.
- When browser is resized or with smaller resolutions, the card templates squish horizontally without adjusting vertically.
