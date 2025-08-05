import multer from "multer";

// on which storage you want to save like memoryStorage or diskStorage like harddisk or memory
const storage = multer.diskStorage({
// then if you have selected diskStorage then in diskStorage storage where you want to save means give destination cb stands for call back , req you will recive and file as well 
    destination: function(req, file, cb){
        cb(null, "../../public/temp")
    },
// as you have selected destination now as well then you have to give the filename name as well which can be given through various ways can check gpt as well 
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
    
})
// after upload export it default
export const upload = multer({
    storage,
})