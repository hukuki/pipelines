import connection from "../../../../storage/db";
import mongoose from "mongoose";

const legislationTreeSchema = new mongoose.Schema({
    providerArticleId: Number,
    
    articleNumber: Number,

    title: String,
    description: String,
    
    articleTitle: String,
    providerReasonId: String,
    providerUpdateDate: Date,

    providerParentId: Number,

    providerLegislationId: {
        type: Number,
        unique: true
    }
}, { timestamps: true, collection: 'tree'} );

legislationTreeSchema.add({
    children: [legislationTreeSchema]
});

type CVLegislationTree = {
    providerArticleId: number | null,
    articleNumber: number | null,
    
    title: string | null,
    description: string | null,
    
    articleTitle: string | null,
    providerReasonId: string | null,
    
    providerUpdateDate: Date | null,
    providerParentId: number | null,

    providerLegislationId: number,
    children: CVLegislationTree[]
};

const CVLegislationTree = mongoose.model("LegislationTree", legislationTreeSchema);

export default CVLegislationTree;