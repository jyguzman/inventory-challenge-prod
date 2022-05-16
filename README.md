# Inventory Tracking App

This is an application to simulate the backend and API of an an inventory tracking application for a logistics company.

For details on usage and testing, read below.

## Usage

Visit the Replit at https://replit.com/@jyguzman/inventory-tracking-app, and click "Run" to start up the application.

You can view a list of al current items by clicking the 'Read Inventory' button. Each item
has an ID, name, quantity, and city.

You can create a new item by providing the listed details: name, quantity, and city.

You can edit an item by filling in new details. The item must be selected by ID, and you can see the IDs with the "Read Inventory" button.

You can remove an item from the inventory by giving the item's ID. You can optionally add a personalized comment with the removal.

You can retrieve a list of removed items by clicking the 'Show Removed Items' button. Each removal has the comment (if none was provided, the comment will be "No comment provided.") and the original details of the removed item.

You can "undelete" an item by selecting its original ID. It will show up again when you click "Read Inventory" and will not show up when you click "Show Removed Items".

Finally, the "Reset Database" button empties the database of all items and deletions, if a data reset is desired.

## Testing

To run the tests, visit the Replit (https://replit.com/@jyguzman/inventory-tracking-app), go to the shell (not the console), type the command "npm test" in the shell and press "enter".