import connection from '../../../../storage/db';
import mongoose from "mongoose";

const precedentMetadataSchema = new mongoose.Schema({
    providerId: {
        type: Number,
        index: true,
        unique: true
    },
    precedentType: Object,

    organizationName: String,
    basisNumberYear: Number,
    basisNumberSerial: Number,

    decisionNumberYear:Number,
    decisionNumberSerial:Number,
    
    //decisionType:null,
    decisionDate: Date,
    status: String,
    decisionNumber: String,
    basisNumber: String
}, { timestamps: true, collection: 'precedent-metadata'} );

type CVPrecedentMetadata = {
    providerId: Number,
    precedentType: Object | null,

    organizationName: String | null,
    basisNumberYear: Number | null,
    basisNumberSerial: Number | null,

    decisionNumberYear:Number | null,
    decisionNumberSerial:Number | null,
    
    //decisionType:null,
    decisionDate: Date | null,
    status: String | null,
    decisionNumber: String | null,
    basisNumber: String | null
};

const CVPrecedentMetadata = mongoose.model("PrecedentMetadata", precedentMetadataSchema);

export default CVPrecedentMetadata;