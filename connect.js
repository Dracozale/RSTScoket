//create by afiq naqiuudin
var express = require('express');
var app = express();
const mssql = require('mssql')

const sqlConfig = {
  password: 'ANsz1686',
  database: 'master',
  // connectionTimeout: undefined,
  // requestTimeout: 30000,
  stream: false,
  options: {
    encrypt: true,
    readOnlyIntent: true
  },
  port: 1433,
  user: 'sa',
  server: 'KULDGDITN064L',
  pool: {
    // acquireTimeoutMillis: 1000,
    // propagateCreateError: true,
  },
}

const Mtrack_pool = new mssql.ConnectionPool(sqlConfig);
const MtrackpoolConnect = Mtrack_pool.connect();

async function main(){
    (async function () {
    await MtrackpoolConnect;
      try{
          //console.log('****** '+obj.courier_id)
          var sqlC="SELECT * FROM [RNDB].[dbo].[Tbl_Request]";
          const queryresult = await Mtrack_pool.query(sqlC)
          console.log("******query pekerja lokasi")
          console.log(queryresult)
          console.log("**************************")

      }catch (e){
        console.log(e);
      }		
    })()

    mssql.on('error', err => {
    console.log(err);
    })
}

main();

 
        
