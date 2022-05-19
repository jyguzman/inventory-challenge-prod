const sqlite3 = require('sqlite3');
const inventoryDB = new sqlite3.Database('inventory.db');
const db_queries = require('../utils/db_queries');
const chai = require('chai');
const chaiHttp = require('chai-http');
const inventoryAPI = require('../server/inventoryAPI');
const should = chai.should();

chai.use(chaiHttp);

process.env.NODE_ENV = 'test';

describe('Inventory API', () => {
    before(() => {
        inventoryDB.run(`
            delete from items;
            delete from deletions;
        `, err => { if (err) console.log(err) })
    })

    describe('/POST /items/create', () => {
        it('it should create a new item by ID with the given name, quantity, and city', (done) => {
            const newItem = { name: 'testItem', quantity: 100, city: "Seattle, US"};
            chai.request(inventoryAPI)
                .post(`/items/create`)
                .send(newItem)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql("Item successfully added.");
                    res.body.data.should.be.a('object');
                    res.body.data.should.have.property('name');
                    res.body.data.should.have.property('quantity');
                    res.body.data.should.have.property('city');
                done();
            })
        })
    })

    describe('/GET /items', () => {
        it('it should retrieve all items in inventory', (done) => {
            chai.request(inventoryAPI)
                .get('/items')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql("Successfully retrieved inventory.");
                    res.body.data.should.be.a('array');
                done();
            })
        })
    })
    
    describe('/GET /items/:itemId', () => {
        it('it should retrieve a specific item from inventory by its ID', (done) => {
            const id = 1;
            chai.request(inventoryAPI)
                .get(`/items/${id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql(`Successfully retrieved item with id ${id}.`);
                    res.body.data.should.be.a('object');
                    res.body.data.item_id.should.be.eql(1);
                done();
            })
        })
    
        it('it should send an error if an item ID does not exist.', (done) => {
            const id = 10000;
            chai.request(inventoryAPI)
                .get(`/items/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.eql(`Error - item with id ${id} not found.`);
                done();
            })
        })
    
        it('it should send an error if an item ID is not a non-negative integer.', (done) => {
            const id = -1;
            chai.request(inventoryAPI)
                .get(`/items/${id}`)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.eql(`Error - item id must be non-nonegative integer.`);
                done();
            })
        })
    })

    describe('/PUT /items/update/:itemId', () => {
        it('it should update a specific item by ID to the updated fields given in a request', (done) => {
            const id = 1;
            const update = {name: 'updatedTestItem', quantity: 100, city: "Seattle, US"}
            chai.request(inventoryAPI)
                .put(`/items/update/${id}`)
                .send(update)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql(`Successfully updated item with id ${id}`);
                    res.body.data.name.should.be.eql('updatedTestItem');
                done();
            })
        })

        it('it should send an error if an item ID does not exist.', (done) => {
            const id = 10000;
            chai.request(inventoryAPI)
                .put(`/items/update/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.eql(`Error - item with id ${id} not found.`);
                done();
            })
        })
    
        it('it should send an error if an item ID is not a non-negative integer.', (done) => {
            const id = -1;
            chai.request(inventoryAPI)
                .put(`/items/update/${id}`)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.eql(`Error - item id must be non-nonegative integer.`);
                done();
            })
        })
    })

    describe('/PUT /items/remove-item/:itemId', () => {
        it('it should remove a specific item by ID from inventory with a comment', (done) => {
            const id = 1;
            const comment = { comment: "Insert comment here." }
            chai.request(inventoryAPI)
                .put(`/items/remove-item/${id}`)
                .send(comment)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql(`Successfully deleted item with comment.`);
                    res.body.data.comment.should.be.eql("Insert comment here.");
                    res.body.data.deletedItem.item_id.should.be.eql(1);
                done();
            })
        })

        it('it should send an error if an item ID does not exist.', (done) => {
            const id = 10000;
            chai.request(inventoryAPI)
                .put(`/items/remove-item/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.eql(`Error - item with id ${id} not found.`);
                done();
            })
        })
    
        it('it should send an error if an item ID is not a non-negative integer.', (done) => {
            const id = -1;
            chai.request(inventoryAPI)
                .put(`/items/remove-item/${id}`)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.eql(`Error - item id must be non-nonegative integer.`);
                done();
            })
        })
    })

    describe('/GET /deletions', () => {
        it('it should retrieve all removed items', (done) => {
            chai.request(inventoryAPI)
                .get('/deletions')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql('Successfully listing removed items.');
                    res.body.data.should.be.a('array');
                done();
            })
        })
    })

    describe('/GET /deletions/:itemId', () => {
        it('it should retrieve a specific removed item with its comment', (done) => {
            const id = 1;
            chai.request(inventoryAPI)
                .get(`/deletions/${id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql(`Successfully retrieved deletion with id ${id}.`);
                    res.body.data.should.be.a('object');
                    res.body.data.should.have.property('comment');
                    res.body.data.item_id.should.be.eql(1);
                done();
            })
        })
    
        it('it should send an error if an item ID does not exist.', (done) => {
            const id = 10000;
            chai.request(inventoryAPI)
                .get(`/deletions/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.eql(`Error - item with id ${id} not found.`);
                done();
            })
        })
    
        it('it should send an error if an item ID is not a non-negative integer.', (done) => {
            const id = -1;
            chai.request(inventoryAPI)
                .get(`/deletions/${id}`)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.eql(`Error - item id must be non-nonegative integer.`);
                done();
            })
        })
    })

    describe('/PUT /deletions/recover-item/:itemId', () => {
        it('it should remove a specific item by ID from inventory with a comment', (done) => {
            const id = 1;
            chai.request(inventoryAPI)
                .put(`/deletions/recover-item/${id}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql(`Successfully recovered item.`);
                    res.body.data.item_id.should.be.eql(1);
                done();
            })
        })

        it('it should send an error if an item ID does not exist.', (done) => {
            const id = 10000;
            chai.request(inventoryAPI)
                .put(`/deletions/recover-item/${id}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.message.should.be.eql(`Error - deletion with item id ${id} not found.`);
                done();
            })
        })
    
        it('it should send an error if an item ID is not a non-negative integer.', (done) => {
            const id = -1;
            chai.request(inventoryAPI)
                .put(`/deletions/recover-item/${id}`)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.message.should.be.eql(`Error - item id must be non-nonegative integer.`);
                done();
            })
        })
    })
})