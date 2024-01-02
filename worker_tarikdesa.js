let axios=require('axios');
var dbasync = require('./db/dbasync');
var data=process.argv.slice(2)
//menangkap parameter dari master
let idtarik=data[0];
let mulai=data[1];
let limitbaris=data[2];


async function masukkan(con,idtarik,kddesa,kdkecam,nmdesa){
    try {
        let sql2 = `INSERT INTO t_desa(
            idtarik,
            kddesa,
            kdkecam,
            nmdesa,
            timesimpan
            ) VALUES(?,?,?,?,NOW())`;
        await dbasync.execTrans(con,sql2,[
           idtarik,
            kddesa,
            kdkecam,
            nmdesa
        ]);
    } catch (error) {
        console.log(error);
        process.send({"error":true,"idtarik":idtarik,"message":"GAGAL","status":4});

        process.exit();

    }
}
//tarik API dari luar
let urlTarik='http://192.168.1.10:4001/data/propinsi/getDesaLimit?mulai='+mulai+'&limit='+limitbaris
console.log("tarik data id : "+idtarik+" "+urlTarik)
axios.get(urlTarik)
  .then(async function (response) {
    console.log("insert data id : "+idtarik)
    //looping insert data
    let con=await dbasync.beginTrans();
    for (let index = 0; index < response.data.length; index++) {
        masukkan(con,idtarik,
            response.data[index].kddesa,
            response.data[index].kdkecam,
            response.data[index].nmdesa)
    }
    await dbasync.commitTrans(con);

  })
  .catch(function (error) {
    //mengirimkan parameter dari master
    console.log(error);
    process.send({"error":true,"idtarik":idtarik,"message":"GAGAL","status":4});
        //tutup worker

    process.exit();
  })
  .finally(function () {
    // always executed
    //mengirimkan parameter dari master
    process.send({"error":false,"idtarik":idtarik,"message":"SUCCESS","status":3});
    //tutup worker
    process.exit();



  });