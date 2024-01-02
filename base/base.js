const ftp = require("basic-ftp") 
var varFtp = require('../ftp/ftpcon');
var fs = require('fs');

module.exports = {
   
    downloadToDir: async (pathLocal, PathRemote) => {
        return new Promise(async (resolve, reject) => {
            const client = new ftp.Client()
            client.ftp.verbose = true
            try {
                await client.access({
                    host: varFtp.host,
                    user: varFtp.user,
                    password: varFtp.password,
                    secure: varFtp.secure
                })
                await client.downloadToDir(pathLocal,PathRemote)

                resolve({'downloaddir':'success'})
            }
            catch(err) {
                resolve({'downloaddir':err})
                // console.log(err)
            }
            client.close()

        })
    },


    downloadTo: async (pathLocal, PathRemote) => {
        // console.log('donlot')
        return new Promise(async (resolve, reject) => {
            const client = new ftp.Client()
            client.ftp.verbose = true;
            // console.log(varFtp)
            try {
                await client.access({
                    host: varFtp.host,
                    user: varFtp.user,
                    password: varFtp.password,
                    secure: varFtp.secure
                })
                // console.log()

                await client.downloadTo(pathLocal,PathRemote)

                resolve({'downloadto':'success'})
            }
            catch(err) {
                resolve({'downloadto':err})
                // console.log(err)
            }
            client.close()

        })
    },

    bacaIsiFile:(namaFile)=>{
        var data = fs.readFileSync(namaFile, 'utf8');
        return data.split('\n').map((line) => line.split('\t'))
    }


}


