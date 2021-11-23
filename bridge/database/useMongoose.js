const mongoose = require("mongoose")
mongoose.connect('mongodb://127.0.0.1:27017/mytest',{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.once("open",()=>{
	console.log('Mongoose!');
})
