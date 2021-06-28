const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { gmail } = require('googleapis/build/src/apis/gmail');
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const path = require("path");
var admin = require("firebase-admin");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const url = require('url');
const fetch = require('node-fetch');
const envFilePath = path.resolve(__dirname, './.env');
const env = require("dotenv").config({ path: envFilePath });
var base64 = require('js-base64').Base64;
const stream = require('getstream'); 
const htmlparser2 = require("htmlparser2");

app.use(bodyParser.json());
app.use(cookieParser());
 
// instantiate a new client (server side) 
const streamClient = stream.connect( 
  't6d6x66485xc', 
  '3q9mx28vhd32ge8bef7s7k4fqxcnzf7cv3nwh7ana5ypwjvsqq5hwqhqqz96ft2d' 
); 
 
const apis = google.getSupportedAPIs();
var serviceAccount = require("./soshwrldinc-firebase-adminsdk-ky99h-dc649f9567.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const userbase = db.collection('UserBase');

const stripe = require('stripe')('------------------------');

async function createPayout() {
  const account = await stripe.accounts.create({
    type: 'express',
  });

  const accountLinks = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
  });

  return {stripe_account_id: account.id, stripe_account_link: accountLinks}
}

const {User, Body, Post} = require('./SoShUser.js');
// const subscriptionName = 'YOUR_SUBSCRIPTION_NAME';
// const timeout = 60;
app.use(express.static(__dirname + '/functions'));

const csrfMiddleware = csrf({ cookie: true });
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

var decode = function(input) {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, '+');
  input = input.replace(/_/g, '/');

  // Pad out with standard base64 required padding characters
  var pad = input.length % 4;
  if(pad) {
    if(pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    input += new Array(5-pad).join('=');
  }

  return input
}

app.get("/getStreamUserToken", (req, res) => {
  const sessionCookie = req.cookies.__session || "";
  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {

      const userToken = client.createUserToken(x.uid);
      res.status(200).send(JSON.stringify({stream_user_token: userToken}))

    });
})

app.get("/revenueReport", (req, res) => {
  var cuid;
  var u = userbase.doc(x.uid).get().then((doc)=>{
    var d = doc.data();
    cuid = d.cuid;
  })
  
  fetch(`https://viglink.io/transactions?cuid=${cuid}&sumByField=publisherRevenue`).then((r)=>{
    res.status(200).send(JSON.stringify({totalRevenue: r.buckets[0].sumValue}))
  })

})

app.post("/sendPayout", (req,res) => {
  const sessionCookie = req.cookies.__session || "";
  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      var wa;
      var aid;
      userbase.doc(x.uid).get().then((d)=>{
        var data = d.data();
        data.forEach((element)=>{
          wa =  element.withdrawal_amount;
          aid = element.stripe_account_id;
        })
      })
      
  const transfer = await stripe.transfers.create({
    amount: wa,
    currency: "usd",
    destination: aid,
  });

}).catch((err)=>{
  res.status(404).send(err);
})

})



app.post('/access', (req,res) => {
  const sessionCookie = req.cookies.__session || "";
  var t = req.body.gmail_access_token;
  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      if(user.id === x.uid){

        userbase.doc(x.uid).update({gmail_access_token: t}).then(()=>{
          res.status(200).send(p);
        })
    }})
    .catch((error) => {
      res.status(404).send('User is not logged in. ', err);
    });


})

app.post('/createuser', (req,res) => {
  const sessionCookie = req.cookies.__session || "";
  var p = req.body.phone_number;
  var f = req.body.first_name;
  var l = req.body.last_name;
  var un = req.body.user_name;
  admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      if(user.id === x.uid){

        userbase.doc(x.uid).set({
          phone_number: p, 
          first_name: f, 
          last_name: l, 
          user_name: un, 
          gmail_access_token: "", 
          gmail_refersh_token: "", 
          post: [], 
          profile_pic: "", 
          pending_amount: "", 
          withdrawal_amount: "",
          bio: "",
          saved_posts: [],
          cuid: ""
        }).then(()=>{
          res.status(200).send(p);
        })
    }
  })
    .catch((error) => {
      res.status(404).send('User is not logged in. ', err);
    });
  });

  app.get("/posts", (req, res) => {
    const sessionCookie = req.cookies.__session || "";
    //watch gmail account
    //send post object
    admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      var d = userbase.doc(x.uid).get((doc)=>{
        var data = doc.data();
        authorize((auth) => {
          getPosts(data.access_token, auth)
        });
        res.status(200).send(JSON.stringify({posts: u.userPosts}))
      })
    });
  })

  //////////////////////////////////////////////////////////////////////////////////////
// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', "https://www.googleapis.com/auth/pubsub"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
//const TOKEN_PATH = 'token.json';
/*
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), (auth) => {
        listUnreadMsgs(auth), watchMyLabel(auth)
    });
});
*/
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(callback) {

  const sessionCookie = req.cookies.__session || "";
  const client_id = "342162757131-r601ab2kkk865gagvk8a83knr544p79q.apps.googleusercontent.com";
  const client_secret = "hFZxZ7R0dJS14P691Tvlm2vf";
  const redirect_uris = "https://soshwrldinc.firebaseapp.com/__/auth/handler";
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris);

    // Check if we have previously stored a token.
    
    admin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      if(user.id === x.uid){

        userbase.doc(x.uid).get().then((documentSnapshot)=>{
          documentSnapshot.data().forEach((element) => {
            //getNewToken(oAuth2Client, callback)
            oAuth2Client.setCredentials(element.access_token);
            callback(oAuth2Client);
          })
        })
    }
  })
    .catch((error) => {
      res.status(404).send('User is not logged in. ', error);
    });
        // if (err) return getNewToken(oAuth2Client, callback);
        // oAuth2Client.setCredentials(JSON.parse(token));
        // callback(oAuth2Client);
    
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            //db.collection('users').doc(auth.uid).update({accesstoken: token}); //==========================>
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listUnreadMsgs(auth) {
    var gmail = google.gmail({
        auth: auth,
        version: 'v1'
    });

    gmail.users.history.list({
        userId: "me",
        startHistoryId: 2982217,
        labelId: 'CATEGORY_PERSONAL'
    }, async function (err, results) {
        // https://developers.google.com/gmail/api/v1/reference/users/history/list#response
        if (err) return console.log(err);
        const latest = await results.data.history[results.data.history.length - 1].messages;
        gmail.users.messages.get({
            userId: 'me',
            id: latest[latest.length - 1].id
        }, (err, res) => {
            if (res.data.labelIds.includes('UNREAD')) {
                console.log(res.data.snippet);
            } else {
                console.log('No unread messages here!');
            }
        });

    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function watchMyLabel(auth) {
    const gmail = google.gmail({
        version: 'v1',
        auth
    });
    const res = await gmail.users.watch({
        userId: 'me',
        requestBody: {
            labelIds: ['CATEGORY_PERSONAL'],
            labelFilterAction: "include",
            topicName: 'projects/soshwrldinc/topics/updates'
        }
    });
}

//client id 342162757131-ltcjavnkgijv5f96e7jbhqbtd0m1jg2g.apps.googleusercontent.com
//client secret xLa_tAN5z9GCCUIGorIqopBb
function listenForMessages(a, auth) {
    const subscriptionName = "projects/soshwrldinc/subscriptions/updates-sub"
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;
  var timeout = 60;
  const messageHandler = message => {
    const po = [];
    const gmail = google.gmail({version: 'v1', auth});
    const name = gmail.users.getProfile.name
    gmail.users.messages.list({
        userId: 'me',
        access_token: a
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
          const labels = res.data.messages
          if(labels.length){
            labels.forEach((l) => {
              gmail.users.messages.get({
                "userId": "me",
                "id": l.id,
                "access_token": a
              }).then(async (res)=>{
                //console.log(res);
                var json = res.result.payload.parts
                      for(var i = 0; i < json.length; i++) {
                        var obj = json[i];
                        if(obj.mimeType == "text/html"){
                          var body = decode(obj.body.data);
                          body = window.atob(body);
                          const post = new Body(body);
                          if(post.isPost){
                            var pox = await post.post;
                            po.push(pox.data)
                          }
                        }
                      }
              }).catch((err)=>{
                console.log(err);
              })
            })
          };
          const user = new User(name, po);
        
          //db.collection('users').doc(x.uid).update({posts: po, name: name})
        
          
          return user;
    })
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on('message', messageHandler);

  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received.`);
  }, timeout * 1000);
}

function recursiveLabels(page){
  gmail.users.messages.list({
    userId: 'me',
    nextPageToken: page
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
      const labels = res.data.messages
  })

}

function recur(a, auth, page, h) {
  const po = h;
  const gmail = google.gmail({version: 'v1', auth});
  const name = gmail.users.getProfile.name
  if(page){
  gmail.users.messages.list({
      userId: 'me',
      access_token: a,
      pageToken: page
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.messages
        if(labels.length){
          labels.forEach((l) => {
            gmail.users.messages.get({
              "userId": "me",
              "id": l.id,
              "access_token": a //---------------------->
            }).then(async (res)=>{
              //console.log(res);
              var json = res.result.payload.parts
                    for(var i = 0; i < json.length; i++) {
                      var obj = json[i];
                      if(obj.mimeType == "text/html"){
                        var body = decode(obj.body.data);
                        body = window.atob(body);
                        const post = new Body(body);
                        if(post.isPost){
                          var pox = await post.post;
                          po.push(pox.data)
                        }
                      }
                    }
            }).catch((err)=>{
              console.log(err);
            })
          })
        };
        const user = new User(name, po);
      
        //db.collection('users').doc(x.uid).update({posts: po, name: name})
      
        
        return po;
  })
} else {
  return po;
}

}

function getPosts(a, auth) {
  const po = [];
  var pageToken;
  const gmail = google.gmail({version: 'v1', auth});
  const name = gmail.users.getProfile.name
  gmail.users.messages.list({
      userId: 'me',
      access_token: a
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.messages
        pageToken = res.nextPageToken;
        if(labels.length){
          labels.forEach((l) => {
            gmail.users.messages.get({
              "userId": "me",
              "id": l.id,
              "access_token": a //---------------------->
            }).then(async (res)=>{
              //console.log(res);
              var json = res.result.payload.parts
                    for(var i = 0; i < json.length; i++) {
                      var obj = json[i];
                      if(obj.mimeType == "text/html"){
                        var body = decode(obj.body.data);
                        body = window.atob(body);
                        const post = new Body(body);
                        if(post.isPost){
                          var pox = await post.post;
                          po.push(pox.data)
                        }
                      }
                    }
            }).catch((err)=>{
              console.log(err);
            })
          })
        };
        //const user = new User(name, po);
      
        //db.collection('users').doc(x.uid).update({posts: po, name: name})
      
        
        
  });
  recur(a, auth, pageToken, po)
  //return po;


}

//listenForMessages();

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().verifyIdToken(idToken).then(function(decodedClaims) {
    // In this case, we are enforcing that the user signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - decodedClaims.auth_time < 5 * 60) {
      return admin.auth().createSessionCookie(idToken, {expiresIn: expiresIn});
    }
    throw new Error('UNAUTHORIZED REQUEST!');
  }).then(function(sessionCookie) {
    // Note httpOnly cookie will not be accessible from javascript.
    // secure flag should be set to true in production.
    const options = {maxAge: expiresIn, secure: false /** to test in localhost */};
    res.cookie('__session', sessionCookie, options);
    res.end(JSON.stringify({status: 'success'}));
  })
  .catch(function(error) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
  });
  // admin
  //   .auth()
  //   .createSessionCookie(idToken, { expiresIn })
  //   .then(async (sessionCookie) => {
  //       const options = { maxAge: expiresIn, httpOnly: true };
  //       res.cookie("session", sessionCookie, options);
  //       res.end(JSON.stringify({ status: "success" }));
  //     })    
  //     .catch((error) => {
  //       res.status(401).send("UNAUTHORIZED REQUEST!");
  //     })
    
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("__session");
  res.redirect("/app/login");
});

app.listen(5000, () => console.log(`Node server listening at https://.web.app:${5000}/`));

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.app = functions.https.onRequest(app);

exports.getStreamUserToken = functions.https.onCall((data, context) => {
  const firebaseIDToken = data.firebaseIDToken;
  return new Promise((resolve, reject) => {
    admin
  .auth()
  .verifyIdToken(firebaseIDToken)
  .then((decodedToken) => {
    const uid = decodedToken.uid;

    const streamUserToken = streamClient.createUserToken(uid);
    resolve({"token":streamUserToken});
    return;
  })
  .catch((err) => {
    reject(err);
    return;
  });

});
});

exports.sendAuthCode = functions.https.onCall((data, context) => {
  const code = data.auth_code;
  const uid = data.uid;
  const client_id = "342162757131-r601ab2kkk865gagvk8a83knr544p79q.apps.googleusercontent.com";
  const client_secret = "hFZxZ7R0dJS14P691Tvlm2vf";
  const redirect_uris = "https://soshwrld.com";
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
  return new Promise((resolve, reject) => {

    oAuth2Client.getToken(code).then((token)=>{
      //oAuth2Client.setCredentials(token);
      
      userbase.doc(uid).update({accessToken: token})
      resolve({"accessToken": token})
    }).catch((err)=>{
      reject(err);
    })
});
});