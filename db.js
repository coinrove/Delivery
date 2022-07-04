const { Client } = require("pg");
const config = require("./config");

class DatabaseHandler 
{
  constructor() 
  {
    this.connection = new Client({
      connectionString: config.database_url,
    })
    this.connection.connect((err) => 
    {
      if (err) 
      {
        console.log(err);
        process.exit(-1);   
      }
    });
    console.log("Successfully connected to database")
  }

  isAddressAdded(address) 
  {
    const sql = `SELECT EXISTS(SELECT 1 FROM wallets WHERE address = '${address}')`;
    
    return new Promise((resolve, reject) => 
    {
      this.connection.query(sql)
      .then((result) => 
      {
        resolve(result.rows[0].exists);
      })
      .catch((err) => 
      {
        reject(err);
      })
    });
  }

  addAddress(address, name, last_transaction_id) 
  {
    const sql = `INSERT INTO wallets(address, name, last_transaction_id, notify) VALUES('${address}', '${name || ""}', '${last_transaction_id || ""}', ${true})`;
    
    return this.connection.query(sql);
  }

  removeAddress(address) 
  {
    const sql = `DELETE FROM wallets WHERE address = '${address}'`;

    return this.connection.query(sql);
  }

  removeAllAddresses() 
  {
    const sql = `DELETE FROM wallets`;

    return this.connection.query(sql);
  }

  removeAddressByName(name) 
  {
    const sql = `DELETE FROM wallets WHERE name = '${name}'`;

    return this.connection.query(sql);
  }

  getAllAddressesAndNames() 
  {
    const sql = `SELECT address, name FROM wallets`;

    return new Promise((resolve, reject) => 
    {
      this.connection.query(sql)
      .then((result) => 
      {
        resolve(result.rows);
      })
      .catch((err) => 
      {
        reject(err);
      })
    })
  }

  getAddressesAndNames() 
  {
    const sql = `SELECT address, name FROM wallets WHERE notify = ${true}`;

    return new Promise((resolve, reject) => 
    {
      this.connection.query(sql)
      .then((result) => 
      {
        resolve(result.rows);
      })
      .catch((err) => 
      {
        reject(err);
      })
    })
  }

  getLastTransactionId(address) 
  {
    const sql = `SELECT last_transaction_id FROM wallets WHERE address = '${address}'`;

    return new Promise((resolve, reject) => 
    {
      this.connection.query(sql)
      .then((result) => 
      {
        resolve(result.rows[0].last_transaction_id);
      })
      .catch((err) => 
      {
        reject(err);
      })
    })
  }

  updateLastTransactionId(address, newlast_transaction_id) 
  {
    const sql = `UPDATE wallets SET last_transaction_id = '${newlast_transaction_id}' WHERE address = '${address}'`;

    return this.connection.query(sql);
  }
}

module.exports = new DatabaseHandler();;