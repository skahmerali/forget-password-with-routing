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


io.on("connection", ()=>{
    console.log("user Connected")
})


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

    console.log("req.cookies: ", req.cookies.jToken);
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

/////////////////////////////// profile


var fs = require("fs")
var multer = require("multer")
var admin = require("firebase-admin")

const storage = multer.diskStorage({ 
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})

var upload = multer({ storage: storage })

const admin = require("firebase-admin");

var serviceAccount = {
    "type": "service_account",
    "project_id": "tweeter0001-16162",
    "private_key_id": "825f68f7141a00fa36a7a532406b53ce10109529",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLTbAnwTqDCzJb\nbuxAff2EPEzsB7us689uxKowtJ1d0sdlKGTHBWKpprFUnwNpeHnsmskNFn4bXadB\nbjvc7eyuC43xW+PrpBpvQ8dXaJsEoKy9fsfwcn0hlLWSrrLFspJx8UiIyg8Ynazt\ntmjQAun0d1RaApXXQteGmUr/HmGsZTaLgXfymHs2mFDEoX0ZB8wWJvFC7QlxSyX8\nb+BfnKUCI63fmJytpZKcukJU2GRwlBInrzMTrJ/79TceqAvYzfxMfUPIPtNArpeH\nf5eUR1U6TfMV3wTO9L0EBzTSqBJKhFgtkaGeBmhxAXf39tk+yI96yNBLYWxz/EO1\n8sv9kVXHAgMBAAECggEASi8c+kSt/ydUxrxhBN90ZI5EW1QvDVg2puqoV4Fwcs34\n6Fam/2Bdsh4bUw97BT9q7gVFG7t7ZKz13RBGU8WVuaSJtOqc7l1BMByBXsnS1wty\nPOtINdrxAhHrd4y7uxwACAfNOezROWA/u7X15QFLMWNhqj6LQrMnRfwlu5XweiEF\ntXJ+wAfpaQYcdPgBna0Eog6PK4aCE+B02bV9V4rTvdY1v960Kv3ez1gdAKlRLl/y\nFIGz3fanMb3XeGQVf4CYNohOo/Jsi3bvvbfbyEpdPyefVtYIjBmLxs4BjgvrAgvS\nMeuYxD9yHhbR2TZYZS09yPvvZ6jstSCNaQwAihjgcQKBgQD0XfCkdbDBKdu+Nx8S\nRgli2TN1iwFA19obQ/YD/ueTVr/rOxq1sS/I6B9PfktW3RNnCILFJx/VRooeBFFa\ncp1jErKFZQgaVqGet/INBsXN1qDaB20sSOegqoLvn96x4bUFbx2tx3O6QNhCZL6s\nP/+nylWxXKJByN7Rd3tzzQwKwwKBgQDU+1BsLcQ8IJFD92CPzYGLWq1JuZ2pnWsK\nDhzSqv+Va3sv9h+crNXxTRPpY1GT3QM+VRuY2tEezZnCTdWn4EpWItA7yJQ2+lPu\n7werZOkziAVot+P9SISJjwBWdE6ZnhG2lPDqZeO8Jwe+/AUCi1MC0Dmm7wAJAuH8\nG418pliwrQKBgBmsCMzuREx2vkwkdFIyI2hMEzjlCpOqWZKFuEHBNMjo0y6+Pdca\nrz93C1sJlJaikRhA76QQsSpxx67Rm05aPiibXT/gVlKWCVKoVniB3qP6SVm+b/y4\nCAV8BFdyPy4G3UKd4stP6duGVnHbLaDg9FXHTutcJPuuQ6JT4BdRUlOLAoGBANQa\nsD372ikTOfgY/YZY4EFa/aalfvlzNy1dXqEDAOPalWTvVQ4gJjRYUZMlgRGjkl5a\nPdCdYpOtqAoUn8m/GejsZLqVB940sLAMRnQPXBsgxFpEgH424R9pVanDzJ86B2Pw\nsniNHh68M/+kVozxGat8mV3BOSTARTRgcCiKNVtFAoGAd0pYwijqVuN0K4ylsY8A\nBW+x6jBNHEIPtJOT/sLTmIGAeKfxG+FrNG4qg7jPBYPFoLSvaJvWAnlLiOygSSIb\nQgdLm7z6j8Pm9ZYFTH4M8coykcc5/QLWrRNt1sMNbuMPdA4Ov16PwOetbxAC6jXe\nolXWm12hF4CGWse7/pdWWIY=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-i3zg9@tweeter0001-16162.iam.gserviceaccount.com",
    "client_id": "102636446531776556099",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-i3zg9%40tweeter0001-16162.iam.gserviceaccount.com"
  };
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "gs://tweeter0001-16162.appspot.com/"
});
const bucket = admin.storage().bucket("https://tweeter0001-16162-default-rtdb.firebaseio.com/");

//==============================================



app.post("/upload", upload.any(), (req, res, next) => { 

    console.log("req.body: ", req.body);
    console.log("req.body: ", JSON.parse(req.body.myDetails));
    console.log("req.files: ", req.files);

    console.log("uploaded file name: ", req.files[0].originalname);
    console.log("file type: ", req.files[0].mimetype);
    console.log("file name in server folders: ", req.files[0].filename);
    console.log("file path in server folders: ", req.files[0].path);

    
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0]) 
                        console.log(req.body.email)
                        userModle.findOne({email: req.body.email},(err,users)=>{
                            console.log(users)
                            if (!err) {
                                users.update({ profilePic: urlData[0]}, {}, function (err, data) {
                                    console.log(users)
                                    res.send({
                                        status: 200,
                                        message: "image uploaded",
                                        picture:users.profilePic
                                    });
                                })
                            }
                            else{
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                            //file removed
                        } catch (err) {
                            console.error(err)
                        }                
                    }
                })
            }else{
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})









const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})