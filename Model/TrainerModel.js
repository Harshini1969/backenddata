const mongoose = require("mongoose");

// schema
let TrainerSchema = mongoose.Schema({
    name: String,
    email:String,
    password:String,
    role:String
})

// model --> Trainer (collection)

let TrainerModel = mongoose.model("trainer", TrainerSchema);

module.exports=TrainerModel;