const base = require('./base/base');
const fs = require('fs');
const decompress = require('decompress');
const dbasync = require('./db/dbasync');
var data=process.argv.slice(2)
//menangkap parameter dari master

let idtarik=data[0];
let nmfile = data[1]
let nmfolder = "dwnfile"

let tujuanEkstrak = nmfolder + '/dist/' + idtarik + '/';

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
       //mengirimkan parameter dari master
        console.log(error);
        process.send({"error":true,"idtarik":idtarik,"message":"GAGAL","status":4});
        //tutup worker
        process.exit();

    }
}


async function downloadDesa() {
    //download FTP
    let hasil = await base.downloadTo(nmfolder + '/' + nmfile, 'desa/' + nmfile);
    if (hasil.downloadto == 'success') {
        //unzip ke folder tujuanEkstrak
        decompress(nmfolder + '/' + nmfile, tujuanEkstrak).then(async(files) => {
            try {
                let con=await dbasync.beginTrans();
                //baca isi file dan insert data
                let data=base.bacaIsiFile(tujuanEkstrak+'desa.txt')
                for (let index = 0; index < data.length; index++) {
                    let kddesa = data[index][0];
                    let kdkecam = data[index][1];
                    let nmdesa = data[index][2];
                    masukkan(con,idtarik,
                        kddesa,
                        kdkecam,
                        nmdesa)
                }

                await dbasync.commitTrans(con);
                //mengirimkan parameter dari master
                process.send({"error":false,"idtarik":idtarik,"message":"SUCCESS","status":3});
                //tutup worker
                process.exit();

                     
            } catch (e) {
                console.log('Error:', e.stack);
                //mengirimkan parameter dari master

                process.send({"error":true,"idtarik":idtarik,"message":"GAGAL","status":4});
                //tutup worker

                process.exit();

            }
        });
    }


}

downloadDesa()