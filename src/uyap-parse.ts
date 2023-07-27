import Pipeline from "./pipeline/index";
import S3Saver from "./pipeline/component/s3-saver";
import ExtractText from "./pipeline/component/uyap/text-extract";

class UYAPParsePipeline extends Pipeline {

    constructor() {
        super();

        this.add(new ExtractText());
    }

}

export default UYAPParsePipeline;