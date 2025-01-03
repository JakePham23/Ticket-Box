'use strict'

import mongoose from 'mongoose'
// import config from '../configs/enviroment.config.js';
// const dbConfig = config.db;
let connectString = 'mongodb+srv://group11_22_1:gr11_22_1_cnpm@ticketboxcluster.ucgdq.mongodb.net/TicketBox?retryWrites=true&w=majority&appName=TicketBoxCluster'
// if(dbConfig.host === 'localhost'){
//      connectString = 'mongodb://localhost:27017/TicketZEN'
// }
// console.log(connectString)
// TODO: Singleton pattern
class Database {

    constructor() {
        this._connect();
    }

    // TODO: Connected to mongodb
    _connect() {
        if (true) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }

        mongoose.connect(connectString, {
            maxPoolSize: 50 // TODO: Max connection
        })
            .then(() => {
                console.log(`Connected to mongodb`)
            })
            .catch(err => {
                console.log('Connect to mongodb failed');
                console.error(err);
            })
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Database();
        }

        return this.instance;
    }

}

export default Database.getInstance();