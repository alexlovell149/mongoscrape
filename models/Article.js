// require mongoose
var mongoose = require('mongoose')
var Schema = mongoose.Schema;

// new Schema
var articleSchema = new Schema({
	headlines: {
		type: String,
		required: true,
		unique: true // make sure the article is not repeated again
	},
	imgURL: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	comment: {
		type:Schema.Types.ObjectId,
		ref:"Comments"
	}
});

// use the abvoe schema to make the ScrapedData model
var Article = mongoose.model('Article', articleSchema);

// export the model so the server can use it
module.exports = Article;