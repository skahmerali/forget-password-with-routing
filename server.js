var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var path = require("path")
var jwt = require('jsonwebtoken')
var {userModel,tweetmodel} = require('./dbcon/module');
var authRoutes = require('./route/auth')
var SERVER_SECRET = process.env.SECRET || "1234";
var app = express();


var http = require("http");
var socketIO = require("socket.io");
var server = http.createServer(app);
var io = socketIO(server);

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));

app.use("/", express.static(path.resolve(path.join(__dirname, "public"))))

app.use('/',authRoutes);
// app.use('/',authRoutes);

app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {

    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone gender createdOn',
        function (err, doc) {
            if (!err) {
                res.send({
                    profile: doc
                })

            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})


app.post('/tweet', (req, res, next) => {
    // console.log(req.body)

    if (!req.body.userName && !req.body.tweet || !req.body.userEmail ) {
        res.status(403).send({
            message: "please provide email or tweet/message"
        })
    }
    var newTweet = new tweetmodel({
        "name": req.body.userName,
        "tweet": req.body.tweet
    })
    newTweet.save((err, data) => {
        if (!err) {
            res.send({
                status: 200,
                message: "Post created",
                data: data
            })
            console.log(data.tweet)
            io.emit("NEW_POST", data)
        } else {
            console.log(err);
            res.status(500).send({
                message: "user create error, " + err
            })
        }
    });
})

app.get('/getTweets', (req, res, next) => {

    console.log(req.body)
    tweetmodel.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
            // data = data[data.length -1]
            res.send(data)
        }
    })
})










const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})