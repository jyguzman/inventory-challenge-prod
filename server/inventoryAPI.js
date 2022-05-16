const express = require('express');
const ejs = require('ejs');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const inventoryDB = new sqlite3.Database('inventory.db');
const { isValidItem, isValidNumberInput } = require('../utils/input_validation_functions');
const { urlencoded } = require('body-parser');
const db_queries = require('../utils/db_queries');
const sendResponse = require('../controllers/controller').sendResponse;
const inventoryAPI = express();
inventoryAPI.use(cors());
inventoryAPI.use(express.json());
inventoryAPI.use(urlencoded({ extended : true }));
inventoryAPI.set('view engine', 'ejs');

inventoryAPI.get('/', (req, res) => {
    res.status(200).render('Pages/LandingPage');
});

inventoryAPI.get('/items', async (req, res) => {
    const response = await db_queries.retrieveInventory(inventoryDB);
    if (response === 'error') {
        sendResponse(res, 500, {message: 'Error retrieving items.'});
        return;
    }
    sendResponse(res, 200, {message: "Successfully retrieved inventory.", data: response}, null, 4);
});

inventoryAPI.get('/items/:id', async (req, res) => {
    const id = parseFloat(req.params.id);
    if (!isValidNumberInput(id)) {
        sendResponse(res, 400, {message: `Error - item id must be non-nonegative integer.`});
        return;
    }
    const response = await db_queries.retrieveItemById(inventoryDB, id);
    if (response === 'error') {
        sendResponse(res, 500, {message: 'Error'});
        return;
    }
    if (!response) {
        sendResponse(res, 404, {message: `Error - item with id ${id} not found.`});
        return;
    }
    sendResponse(res, 200, {message: `Successfully retrieved item with id ${id}.`, data: response});
})

inventoryAPI.post('/items/create', async (req, res) => {
    const item = req.body;
    if(!isValidItem(item)) {
        sendResponse(res, 404, { message: `Error: please ensure all fields are filled,` +
            ` 'name' and 'city' are not numbers, and quantity is a` +
            ` non-negative integer.`})
        return;
    }
    item.quantity = parseFloat(item.quantity);
    const response = await db_queries.createItem(inventoryDB, item);
    if (response === 'error') {
        sendResponse(res, 500, {message: 'Error inserting item into database.'});
        return;
    }
    sendResponse(res, 200, {message: "Item successfully added.", data: response}, null, 4);
})

inventoryAPI.put('/items/update/:id', async (req, res) => {
    const id = parseFloat(req.params.id);
    if (!id || !isValidNumberInput(id)) {
        sendResponse(res, 400, {message: `Error - item id must be non-nonegative integer.`});
        return;
    }
    const item = await db_queries.retrieveItemById(inventoryDB, id);
    if (!item) {
        sendResponse(res, 404, {message: `Error - item with id ${id} not found.`});
        return;
    }
    const update = req.body; 
    if (!isValidItem(update)) {
        sendResponse(res, 404, { message: `Error: please ensure all fields are filled,` +
            ` 'name' and 'city' are not numbers, and quantity is a` +
            ` non-negative integer.`})
        return;
    }
    const response = await db_queries.updateItem(inventoryDB, update, id);
    if (response === 'error') {
        sendResponse(res, 500, {message: `Error updating item with id ${id}` });
        return;
    }
    sendResponse(res, 200, {message: `Successfully updated item with id ${id}`, data: response});
})

inventoryAPI.post('/items/remove-item/:id', async (req, res) => {
    const id = parseFloat(req.params.id);
    if (!isValidNumberInput(id)) {
        sendResponse(res, 400, {message: `Error - item id must be non-nonegative integer.`});
        return;
    }
    const item = await db_queries.retrieveItemById(inventoryDB, id);
    if (!item) {
        sendResponse(res, 404, {message: `Error - item with id ${id} not found.`});
        return;
    }
    let comment = req.body.comment;
    if (!comment) comment = "No comment provided.";
    const response = await db_queries.deleteItemAndAddComment(inventoryDB, comment, item);
    if (response === 'error') {
        sendResponse(res, 500, {message: `Error deleting and commenting on item deletion with id ${id}` });
        return;
    }
    sendResponse(res, 200, {message: `Successfully deleted item with comment.`, data: response })

})

inventoryAPI.get('/deletions', async (req, res) => {
    const deletions = await db_queries.retrieveDeletions(inventoryDB);
    if (deletions === 'error') {
        sendResponse(res, 500, `Error retrieving removed items.`);
        return;
    }
    sendResponse(res, 200, {message: 'Successfully listing removed items.', data: deletions});
})

inventoryAPI.get('/deletions/:itemId', async (req, res) => {
    const id = parseFloat(req.params.itemId);
    if (!isValidNumberInput(id)) {
        sendResponse(res, 400, {message: `Error - item id must be non-nonegative integer.`});
        return;
    }
    const response = await db_queries.retrieveDeletionByItemId(inventoryDB, id);
    if (response === 'error') {
        sendResponse(res, 500, {message: 'Error'});
        return;
    }
    if (!response) {
        sendResponse(res, 404, {message: `Error - item with id ${id} not found.`});
        return;
    }
    sendResponse(res, 200, {message: `Successfully retrieved deletion with id ${id}.`, data: response});
})

inventoryAPI.post('/deletions/recover-item/:id', async (req, res) => {
    const id = parseFloat(req.params.id);
    if (!isValidNumberInput(id)) {
        sendResponse(res, 400, {message: `Error - item id must be non-nonegative integer.`});
        return;
    }
    const deletion = await db_queries.retrieveDeletionByItemId(inventoryDB, id);
    if (!deletion) {
        sendResponse(res, 404, {message: `Error - deletion with item id ${id} not found.`});
        return;
    }
    const response = await db_queries.undeleteItem(inventoryDB, id);
    if (response === 'error') {
        sendResponse(res, 500, {message: 'Error recovering item.'});
        return;
    }
    sendResponse(res, 200, {message: `Successfully recovered item.`, data: response});
})

inventoryAPI.delete('/delete-all', async (req, res) => {
    const response = await db_queries.resetTables();
    if (response === 'error') {
        sendResponse(res, 500, {message: "Error deleting all data."});
        return;
    }
    sendResponse(res, 200, {message: "Successfully deleted all data."});
})

inventoryAPI.all('*', (req, res) => {
    res.format({
        'text/html': function() {
            res.status(404).render('Pages/Error', { errorMessage: "404 Not Found" })
        },
        'application/json': function() {
            res.status(404).json({message: "Error - 404 Not Found"});
        }
    })
})

inventoryAPI.listen(3001);

module.exports =  inventoryAPI 

