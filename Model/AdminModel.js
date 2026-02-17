const mongoose = require("mongoose");

// schema
let AdminSchema = mongoose.Schema({
    name: String,
    email:String,
    password:String,
    role:String
})

// model --> Admin(collection)

let AdminModel = mongoose.model("Admin", AdminSchema);

module.exports=AdminModel;