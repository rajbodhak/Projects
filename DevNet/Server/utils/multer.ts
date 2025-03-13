import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });
// console.log("Multer initialized:", !!upload);
export default upload;