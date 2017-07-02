// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var ObjectId = require('mongojs').ObjectID;
var cheerio = require("cheerio");
var request = require("request");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var exphbs = require("express-handlebars");

var hbs = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        addOne: function(value, options) {
            return parseInt(value) + 1;
        }
    }
});

// setting the port for heroku to deploy on
var port = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.engine("handlebars", exphbs({ defaultLayout: "main", }));
app.set("view engine", "handlebars");

var Article = require("./models/Article");
var Comments = require("./models/Comments");

// Make public a static dir
app.use(express.static(__dirname + "/public"));



// Database configuration with mongoose
mongoose.connect('mongodb://localhost/scraper');
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});



// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});



app.delete("/delete", function(req, res) {
    Article.deleteMany().exec(function(err, doc) {
        // Log any errors
        if (err) {
            console.log(err);
        } else {

            res.json(doc);
            console.log("comment deleted");
        }
    })
    Comments.deleteMany().exec(function(err, doc) {

    })

})

app.delete("/articles2/:id", function(req, res) {



    Article.deleteOne({ "_id": req.params.id })

    .exec(function(err, doc) {
        // Log any errors
        if (err) {
            console.log(err);
        } else {
            // Or send the document to the browser
            res.json(doc);
            console.log("comment deleted");
        }
    })

})


app.get("/scrape", function(req, res) {
    var obj = { title: "x" }
    var total = []
    total.push(obj)
    var counter = 0
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            total.push(doc);
        }
    });

    request("http://www.ajc.com/", function(error, response, html) {
        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // An empty array to save the data that we'll scrape
        var headlines = {};

        // With cheerio, find each h1-tag with the "title" class
        // (i: iterator. element: the current element)
        $("div.tiles small-story-tiles  margin-bottom module-list").each(function(i, element) {

            // Save the text of the element (this) in a "title" variable
            headlines.title = $(this).children("a").text();

            headlines.imgURL = $(element).find("a").find("img").attr("src");

            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");

            // Save these results in an object that we'll push into the result array we defined earlier
            headlines.push({
                title: title,
                imgURL: imgURL,
                link: link
            });
            console.log(result);
        });

    });
});

// Log the result once cheerio analyzes each of its selected elements



app.get("/articles", function(req, res) {

    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.send(doc);
        }
    });
});




app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db
    Article.findOne({ "_id": req.params.id })
        // populate all of the comments associated with it
        .populate("comment")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});




app.post("/articles/:id", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    var newComments = new Comments(req.body);

    // And save the new comment to the db
    newComments.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's comment
            Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

app.listen(3000, function() {
    console.log("App running on port 3000!");
});
