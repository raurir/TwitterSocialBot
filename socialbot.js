var Promise = require("promise");
var Twitter = require("twitter");

module.exports = (function() {
  var client;
  var hits = 0; // local testing limit.

  function initClient(authsettings) {
    if (client) return client;
    // console.log("initialising client");
    client = new Twitter(authsettings);
    // console.log("client", client)
    return client;
  }

  function getUserFromId(user_id) {
    console.log("Socialbot getUserFromId", user_id);
    return new Promise(function(fulfill, reject) {
      client.get("users/show", { user_id }, function(error, reply) {
        if (error) {
          reject(error);
        } else {
          fulfill(reply);
        }
      });
    });
  }

  function getUserFromName(screen_name) {
    console.log("Socialbot getUserFromName", screen_name);
    return new Promise(function(fulfill, reject) {
      client.get("users/show", { screen_name }, function(error, reply) {
        if (error) {
          reject(error);
        } else {
          fulfill(reply);
        }
      });
    });
  }

  function getFollowers() {
    // console.log("getFollowers");
    return new Promise(function(fulfill, reject) {
      client.get("followers/ids", function(error, reply) {
        if (error) {
          // console.log("getFollowers error:", error);
          reject(error);
        } else {
          // console.log("getFollowers success:", reply);
          fulfill(reply);
          // var followers = reply.ids; //, randFollower = randIndex(followers);
        }
      });
    });
  }

  function getFollowing(user_id) {
    console.log("getFollowing", user_id);
    return new Promise(function(fulfill, reject) {
      try {
        console.log("getFollowing inside promise", user_id);
        var param = user_id ? { user_id: user_id } : {};
        client.get("friends/ids", param, function(error, reply) {
          if (error) {
            console.log("get friend ids", error);
            reject(error);
          } else {
            var friends = reply.ids;
            if (friends.length) {
              console.log("getFollowing of", user_id, friends.length); //, friends.join(" / "));
              fulfill(friends);
            } else {
              console.log("rejected no friends...");
              reject("NO_FRIENDS");
            }
          }
        });
      } catch (err) {
        console.log("getFollowing err", err);
        reject();
      }
    });
  }

  function getTweetRate(screen_names) {
    return new Promise(function(fulfill, reject) {
      try {
        if (!Array.isArray(screen_names))
          return reject(
            "getTweetRate expects array of screen_names!",
            screen_names
          );

        screen_names.forEach(screen_name => {
          getTweets({ screen_name, count: 600 }).then(tweets => {
            const months = [];
            const tweetsPerMonth = [];
            tweets.forEach(tweet => {
              const t = tweet.created_at;
              const d = new Date(t);
              const y = d.getFullYear();
              let m = d.getMonth() + 1;
              if (String(m).length === 1) m = "0" + m;

              let ym = `${y}-${m}`;
              let index = months.indexOf(ym);

              if (index === -1) {
                months.push(ym);
                index = months.length - 1;
                tweetsPerMonth[index] = 0;
              }

              tweetsPerMonth[index]++;
            });

            console.log(`Tweet rate for ${screen_name}`);
            tweetsPerMonth.forEach((tpm, index) => {
              let ym = months[index];
              console.log(
                `for month ${ym} tweets per day: ${(tpm / 30).toFixed(
                  1
                )} and per month: ${tpm}`
              );
            });
            console.log(`------------------`);
            fulfill(tweetsPerMonth);
          });
        });
      } catch (err) {
        console.log("getTweetRate err", err);
        reject();
      }
    });
  }

  function getTweets(params) {
    console.log("SocialBot.getTweets attempt", params);
    return new Promise(function(fulfill, reject) {
      if (params.id || params.screen_name) {
        try {
          client.get("statuses/user_timeline", params, function(
            error,
            response
          ) {
            if (error) {
              console.log("getTweets error 01", error);
              reject(error);
            } else {
              // console.log("=====================================");
              // console.log("followFriend fulfill response", response);
              // console.log("=====================================");
              // console.log("followFriend fulfill name:", response.name, "location:", response.location, "description:", response.description, "url:", response.url);
              fulfill(response);
            }
          });
        } catch (err) {
          console.log("SocialBot.getTweets error 02", err);
          reject(err);
        }
      } else {
        console.log("SocialBot.getTweets error 03 no user id!");
        reject(null);
      }
    });
  }

  function followFriend(user_id) {
    // console.log("followFriend attempt", user_id);
    return new Promise(function(fulfill, reject) {
      if (user_id) {
        try {
          client.post("friendships/create", { id: user_id }, function(
            error,
            response
          ) {
            if (error) {
              console.log("followFriend error 01", error);
              reject(error);
            } else {
              // console.log("=====================================");
              // console.log("followFriend fulfill response", response);
              // console.log("=====================================");
              // console.log("followFriend fulfill name:", response.name, "location:", response.location, "description:", response.description, "url:", response.url);
              fulfill(response);
            }
          });
        } catch (e) {
          console.log("followFriend error 02", e);
          reject(e);
        }
      } else {
        console.log("followFriend no friend to follow!");
        reject(null);
      }
    });
  }

  function unfollowFriend(user_id) {
    // console.log("unfollowFriend", user_id);
    return new Promise(function(fulfill, reject) {
      if (user_id) {
        try {
          client.post("friendships/destroy", { id: user_id }, function(
            error,
            response
          ) {
            if (error) {
              console.log("unfollowFriend error 01", error);
              reject(error);
            } else {
              console.log("unfollowFriend success");
              // console.log("unfollowFriend fulfill response", response);
              fulfill(user_id);
            }
          });
        } catch (e) {
          console.log("unfollowFriend error 02", e);
          reject(e);
        }
      } else {
        console.log("unfollowFriend no friend to follow!");
        reject(null);
      }
    });
  }

  function postMedia(image) {
    return new Promise(function(fulfill, reject) {
      console.log("postMedia", image);

      hits++;
      if (hits > 2) {
        // console.log("too many hits!");
        reject(new Error("more than 5 hits!"));
      }

      console.log("trying client.post!", client);
      try {
        client.post("media/upload", { media: image }, function(
          error,
          media,
          response
        ) {
          if (error) {
            console.log("postMedia reject 01", error);
            reject(error);
          } else {
            // console.log("postMedia fulfill!");
            fulfill(media);
          }
        });
      } catch (e) {
        console.log("postMedia reject 03", e);
        reject(e);
      }
    });
  }

  function postTweet(status) {
    return new Promise(function(fulfill, reject) {
      // console.log("postTweet media success", status);
      try {
        client.post("statuses/update", status, function(
          error,
          tweet,
          response
        ) {
          if (error) {
            console.log("postTweet reject 02", error);
            reject(error);
          } else {
            // console.log("postTweet fulfill");
            fulfill(tweet);
          }
        });
      } catch (e) {
        console.log("postTweet reject 01", e);
        reject(e);
      }
    });
  }

  return {
    followFriend,
    getFollowers,
    getFollowing, // used to be getFriends!
    getFriends: function() {
      console.warn("getFriends deprecated! use getFollowing");
    },
    getTweetRate,
    getTweets,
    getUserFromId,
    getUserFromName,
    initClient,
    postMedia,
    postTweet,
    unfollowFriend
  };
})();
