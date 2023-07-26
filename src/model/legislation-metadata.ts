import connection from '../db.js';
import mongoose from "mongoose";

const legislationMetadataSchema = new mongoose.Schema({
    title: String,
    attachments: Array,
    
    providerId: {
        type: Number,
        index: true,
        unique: true
    },
    providerUpdateDate: Date,
    
    legislationNumber: Number,
    
    legislationComposition: Number,
    legislationType: Object,
    gazzetteNumber: Number,
    gazzetteDate: Date,

    repetitive: Boolean,
    url: String
}, { timestamps: true, collection: 'metadata'} );

type CVLegislationMetadata = {
    title: String | null,
    attachments: String[] | null,
    
    providerId: Number | null,
    providerUpdateDate: Date | null,
    legislationNumber: Number | null,
    
    legislationComposition: Number | null,
    legislationType: Object | null,
    gazzetteNumber: Number | null,
    gazzetteDate: Date| null,
    
    repetitive: Boolean | null,
    url: String | null
};

const CVLegislationMetadata = mongoose.model("LegislationMetadata", legislationMetadataSchema);

export default CVLegislationMetadata;