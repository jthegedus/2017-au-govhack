const functions = require("firebase-functions");
const admin = require("firebase-admin");
const secureCompare = require("secure-compare");

// init the db with admin privileges
admin.initializeApp(functions.config().firebase);

exports.registerUser = functions.https.onRequest((request, response) => {
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.set(
    {
      // User data
      userId: request.body.userId,
      userNotificationToken: request.body.userNotificationToken,

      //lat long
      userLat: request.body.userLat,
      userLong: request.body.userLong,

      // notification
      notifyTime: request.body.notifyTime,

      // rubbish
      rubbishStartTime: request.body.rubbishStartTime,
      rubbishIntervalWeeks: request.body.rubbishIntervalWeeks,

      // recycling
      recycleStartTime: request.body.recycleStartTime,
      recycleIntervalWeeks: request.body.recycleIntervalWeeks
    },
    function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
      } else {
        console.log("User Registered successfully.");
      }
    }
  );
  response.status(200).send();
});

exports.deleteUser = functions.https.onRequest((request, response) => {
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.set({}, function(error) {
    if (error) {
      console.log("User data could not be deleted." + error);
    } else {
      console.log("User Deleted successfully.");
    }
  });

  response.status(200).send();
});

exports.updateUser = functions.https.onRequest((request, response) => {
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.update(
    {
      // User data
      userId: request.body.userId,
      userNotificationToken: request.body.userNotificationToken,

      // notification
      notifyTime: request.body.notifyTime,

      //lat long
      userLat: request.body.userLat,
      userLong: request.body.userLong,

      // rubbish
      rubbishStartTime: request.body.rubbishStartTime,
      rubbishIntervalWeeks: request.body.rubbishIntervalWeeks,

      // recycling
      recycleStartTime: request.body.recycleStartTime,
      recycleIntervalWeeks: request.body.recycleIntervalWeeks
    },
    function(error) {
      if (error) {
        console.log("User could not be updated." + error);
      } else {
        console.log("User Updated successfully.");
      }
    }
  );
  response.status(200).send();
});

exports.getUser = functions.https.onRequest((request, response) => {
  var ref = admin
    .database()
    .ref("users/" + request.body.userId)
    .once("value")
    .then(function(snapshot) {
      userNotificationToken = snapshot.val().userNotificationToken;
      notifyTime = snapshot.val().notifyTime;
      latitude = snapshot.val().userLat;
      longitude = snapshot.val().userLong;
      rubbishStartTime = snapshot.val().rubbishStartTime;
      rubbishIntervalWeeks = snapshot.val().rubbishIntervalWeeks;
      recycleStartTime = snapshot.val().recycleStartTime;
      recycleIntervalWeeks = snapshot.val().recycleIntervalWeeks;

      var responseJSON = {
        // User data
        userId: request.body.userId,
        userNotificationToken: userNotificationToken,

        // notification
        notifyTime: notifyTime,

        latitude: latitude,
        longitude: longitude,

        // rubbish
        rubbishStartTime: rubbishStartTime,
        rubbishIntervalWeeks: rubbishIntervalWeeks,

        // recycling
        recycleStartTime: recycleStartTime,
        recycleIntervalWeeks: recycleIntervalWeeks
      };

      response.json(responseJSON);
    });
});

/**
 * this is called from a Zapier timed webhook - https://zapier.com/zapbook/webhook/
 * When requested this Function will delete every user accounts that has been inactive for 30 days.
 * The request needs to be authorized by passing a 'key' query parameter in the URL. This key must
 * match a key set as an environment variable using `firebase functions:config:set cron.key="YOUR_KEY"`.
 */
exports.sendNotification = functions.https.onRequest((request, response) => {
  // check the Security Key used by 3rd Parties to trigger this function
  const key = request.query.key;

  // Exit if the keys don't match
  if (!secureCompare(key, functions.config().cron.key)) {
    console.log(
      "The key provided in the request does not match the key set in the environment. Check that",
      key,
      "matches the cron.key attribute in `firebase env:get`"
    );
    response
      .status(403)
      .send(
        'Security key does not match. Make sure your "key" URL query parameter matches the ' +
          "cron.key environment variable."
      );
    return;
  }
  // get current UTC time

  // query db for all users, filter on time by converting the userDay and userTime to UTC

  // call FCM with all users data

  console.log("Triggered from Zapier");
  response.status(200).send();
});
