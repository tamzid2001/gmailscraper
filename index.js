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

var serviceAccount = require("./icarus-b84d3-firebase-adminsdk-5k6n2-dbbdad5740.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

import {User, Body, Post} from './SoShUser.js'
// const subscriptionName = 'YOUR_SUBSCRIPTION_NAME';
// const timeout = 60;

// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', "https://www.googleapis.com/auth/pubsub"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), (auth) => {
        listUnreadMsgs(auth), watchMyLabel(auth)
    });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
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
            db.collection('users').doc(auth.uid).update({accesstoken: token});
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
        labelId: 'Label_8061975816208384485'
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
            labelIds: ['Label_8061975816208384485', 'UNREAD'],
            labelFilterAction: "include",
            topicName: 'projects/soshwrldinc/topics/updates'
        }
    });
}
//client id 342162757131-ltcjavnkgijv5f96e7jbhqbtd0m1jg2g.apps.googleusercontent.com
//client secret xLa_tAN5z9GCCUIGorIqopBb
function listenForMessages() {
    const subscriptionName = "projects/soshwrldinc/topics/updates"
  // References an existing subscription
  const subscription = pubSubClient.subscription(subscriptionName);

  // Create an event handler to handle messages
  let messageCount = 0;

  const messageHandler = message => {
    const po = [];
    const gmail = google.gmail({version: 'v1', auth});
    const name = gmail.users.getProfile.name
    gmail.users.messages.list({
        userId: 'me',
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
          const labels = res.data.messages
          if(labels.length){
            labels.forEach((l) => {
              console.log(l.id);
              console.log(res.data.messages.values());
              const b = new Body(l.raw)
              if(b.isPost()){
                po.push(b.post());
              }
            })
          };
          const user = new User(name, po);
        
        db.collection('users').doc(auth.uid).update({posts: po, name: name})
        
          
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

listenForMessages();