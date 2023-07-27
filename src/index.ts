import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";

import UYAPScrapePipeline from "./uyap-scrape"

import Pipeline from './pipeline/index';
import ExtractText from './pipeline/component/uyap/text-extract';
import mongoose from "mongoose";
 
connection.once('open', async () => {
    try{
        await connection.dropCollection("metadata");
    }catch(e){
    }
    try{
        await connection.dropCollection("tree");    
    }catch(e){
    }

    const pipeline = new UYAPScrapePipeline();

    //pipeline.add(new ExtractText());

    await pipeline.run();
    console.log("Done");

    await mongoose.disconnect();
});