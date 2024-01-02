var cp=require('child_process')
const path=require('path')
var dbasync = require('./db/dbasync');
var cron = require('node-cron');
const LIMIT=100

// status
// 1. kode : 0 belum proses
// 2. kode : 2 sudah diambil (siap diproses)
// 3. kode : 3 success insert data
// 4. kode : 4 gaga l insert data

async function runTarik(){
    try {
        console.log('lewat sini')
        //ambil data status 0
        let sql = `SELECT * FROM t_paramtarik WHERE statusbaris=0 LIMIT `+LIMIT;
        console.log('exec data')
        let hasil=await dbasync.myexec(sql);
        console.log(hasil)
        if(hasil.length>0){
            let con=await dbasync.beginTrans();

            for (let index = 0; index < hasil.length; index++) {
                const element = hasil[index];
                //status langsung diubah menjadi 2
                let sql2 = `UPDATE t_paramtarik SET statusbaris=2 WHERE idtarik=`+element.idtarik;
                await dbasync.execTrans(con,sql2);
            }
            
            await dbasync.commitTrans(con);
            //data di looping
            for (let index = 0; index < hasil.length; index++) {
                const element = hasil[index];
                //run worker sesuai jenis
                console.log('run '+element.idtarik)
                if(element.jns==1){
                    //worker utk penarikan API dan insert ke dalam DB
                    //susun param adalah parameter dari tabel t_paramtarik
                    let susunParam=[element.idtarik,element.mulai,element.limitbaris]
                    var child=cp.fork("worker_tarikdesa.js",susunParam)
                } else {
                    //worker utk mendownload file dari FTP dan insert ke dalam DB
                    //susun param adalah parameter dari tabel t_paramtarik
                    let susunParam=[element.idtarik,element.nmfile]
                    var child=cp.fork("worker_tarikfile.js",susunParam)
                }
                
                //listener utk menangkap hasil proses dari worker
                child.on('message',async (data)=>{
                        //update berdasarkan parameter dari worker
                        console.log(`App received ${data.message} insert ${data.idtarik}`)
                        try {
                            let sqlUpdate = `UPDATE t_paramtarik SET statusbaris=`+data.status+` WHERE idtarik=`+data.idtarik;
                            await dbasync.myexec(sqlUpdate)
                        } catch (error) {
                            console.log(`error from child ${error}`)
                        }
                   
                  
              

                })            
            }         
 
        }
  
    } catch (error) {
        console.log(error)
    }

}

let runke=0

cron.schedule('*/2 * * * * *', () => {
    runke=runke+1
    console.log('set internal run '+runke)
    runTarik();
  });


