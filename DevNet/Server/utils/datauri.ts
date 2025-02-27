import DataUriParser from "datauri/parser";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file: { originalname: string; buffer: Buffer }): string | null => {
    if (!file || !file.originalname || !file.buffer) {
        console.error("Invalid file object provided to getDataUri");
        return null; // Handle missing file safely
    }

    const extName = path.extname(file.originalname);
    const dataUri = parser.format(extName, file.buffer)?.content;

    if (!dataUri) {
        console.error("Failed to generate Data URI");
        return null;
    }

    return dataUri;
};

export default getDataUri;
