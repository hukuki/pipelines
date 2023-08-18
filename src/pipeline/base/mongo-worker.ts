const CVPrecedentMetadata = require('../uyap/precedent/model/legislation-metadata');
const connection =  require("../../storage/db")
const { workerData, parentPort } = require("worker_threads")

parentPort?.on('message', async (data: any) => {
    const model = CVPrecedentMetadata.default;

    try{
        await model.create(data);
    }catch(e){
        if(!(await model.find(data)))
            throw e;
        else
            console.log("Already exists.");
    }
});