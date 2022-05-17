const sqlite3 = require('sqlite3');

const createDatabase = () => {
    const inventory = new sqlite3.Database('inventory.db', err => {
        if (err) {
            console.log("Error opening database");
            return;
        }
        console.log('Created database');
        createTables(inventory);
    })
}

const resetTables = () => {
    new sqlite3.Database('inventory.db').exec(`
        drop table if exists items;
        drop table if exists deletions;
        create table items (
            item_id integer primary key,
            name text integer not null,
            quantity integer not null,
            city text not null        
        );
        create table deletions (
            comment text,
            item_id integer primary key not null,
            name text integer not null,
            quantity integer null,
            city text not null  
        );
    `, (err) => { 
        if (err) return "error";
        return 'success'; 
    })
}

const retrieveInventory = (inventoryDB) => {
    return new Promise((resolve, reject) => (
        inventoryDB.all(`select * from items;`, (err, items) => {
            if (err) {
                console.log(err)
                reject('error');
            }
            resolve(items);
        })
    ))
}

const retrieveItemById = (inventoryDB, itemId) => {
    return new Promise((resolve, reject) => {
        const query = `select * from items where item_id = ?;`
        inventoryDB.get(query, itemId, (err, item) => {
            if (err) reject('error');
            resolve(item);
        })
    })
}

const retrieveDeletions = (inventoryDB) => {
    return new Promise((resolve, reject) => {
        inventoryDB.all(`select * from deletions;`, (err, deletions) => {
            if (err) reject('error');
            resolve(deletions);
        })
    })
}

const retrieveDeletionByItemId = (inventoryDB, itemId) => {
    return new Promise((resolve, reject) => {
        const query = `select * from deletions where item_id = ?;`
        inventoryDB.get(query, parseFloat(itemId), (err, deletion) => {
            if (err) reject('error');
            resolve(deletion);
        })
    })
}

const createItem = (inventoryDB, item) => {
    return new Promise((resolve, reject) => {
        const params = Object.values(item);
        const query = `
            insert into items (name, quantity, city) 
            values (?, ?, ?);
        `
        inventoryDB.run(query, params, (err) => {
            if (err) reject('error');
            resolve(item);
        })
    })
}

const updateItem = (inventoryDB, item, itemId) => {
    return new Promise((resolve, reject) => {
        const params = Object.values(item);
        params.push(parseFloat(itemId));
        const query = `
            update items set name = ?, 
            quantity = ?, city = ? where item_id = ?;
        `;
        
        inventoryDB.run(query, params, async (err) => {
            if (err) reject("err");
                const item = await retrieveItemById(inventoryDB, itemId);
                resolve(item);
        })
    })
}

const deleteItem = (inventoryDB, itemId) => {
    return new Promise((resolve, reject) => {
        const query = `delete from items where item_id = ?`;
        inventoryDB.run(query, parseFloat(itemId), (err) => {
            if (err) reject('error');
            resolve();
        })
    })
}

const deleteItemAndAddComment = (inventoryDB, comment, item) => {
    return new Promise(async (resolve, reject) => {
        const query = `
            insert into deletions (comment, item_id, name, quantity, city)
                values (?, ?, ?, ?, ?);
        `
        const params = Object.values(item);
        params.unshift(comment);
        await deleteItem(inventoryDB, item.item_id);
        inventoryDB.run(query, params, (err) => {
            if (err) reject('error');
        })
        resolve({comment: comment, deletedItem: item});
    })
}

const undeleteItem = (inventoryDB, itemId) => {
    return new Promise((resolve, reject) => {
        const query = `
            select item_id, name, quantity, city from deletions
                where item_id = ?;
        `
        inventoryDB.get(query, itemId, (err, recoveredItem) => {
            if (err) reject('error');
            const recoveredItemParams = Object.values(recoveredItem);
            inventoryDB.run(`
                insert into items (item_id, name, quantity, city) 
                values (?, ?, ?, ?);
                `, recoveredItemParams, (err) => {
                if (err) reject('error');
            }, err => {
                if (err) reject('error')
                inventoryDB.run('delete from deletions where item_id = ?', itemId, err => {
                    if (err) reject('error')
                    resolve(recoveredItem);
                })
            })
        })
    })
}

module.exports = { 
    resetTables,
    retrieveInventory, 
    retrieveItemById, 
    createItem, 
    updateItem,
    deleteItem,
    retrieveDeletions,
    retrieveDeletionByItemId,
    deleteItemAndAddComment,
    undeleteItem
}