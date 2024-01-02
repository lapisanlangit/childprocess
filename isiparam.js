var dbasync = require('./db/dbasync');

const TOTAL = 80000
const DITARIK=1000
const HASILBAGI=(TOTAL/DITARIK)
let cekLebih=HASILBAGI%1
let SISABAGI=TOTAL-(parseInt(HASILBAGI)*DITARIK)
DIBAGI = cekLebih>0 ? parseInt(HASILBAGI)+1 : HASILBAGI;

async function isiParam() {
    try {

        let con = await dbasync.beginTrans();
        let idtarik = 0
        let mulai = 0;
        let limitbaris = 0
        for (let index = 0; index < DIBAGI; index++) {
            idtarik = idtarik + 1
            mulai = (index * DITARIK) + 1;
            limitbaris = index==DIBAGI-1 && cekLebih>0 ? SISABAGI : DITARIK;
            let sql1 = `INSERT INTO t_paramtarik(
                idtarik,
                jns,
                mulai,
                limitbaris,
                statusbaris
                )VALUES(?,?,?,?,?)`;
            let hasil = await dbasync.execTrans(con, sql1, [idtarik,1,mulai,limitbaris,0]);
        }
        await dbasync.commitTrans(con);
        console.log('Done isiParam')
    } catch (error) {
        console.log(error)
    }

}

isiParam()





