const mongoose = require("mongoose");

// schema
let StudentSchema = mongoose.Schema({
    name: String,
    email:String,
    password:String,
    role:String,
    refreshToken: String

})

// model --> student (collection)

let studentModel = mongoose.model("student", StudentSchema);

module.exports=studentModel;