var Promise = require('promise');
var Twitter = require("twitter");

var con = console;

module.exports = (function() {

  var client;
  var hits = 0; // local testing limit.

  function initClient(authsettings) {
    if (client) return client;
    // con.log("initialising client");
    client = new Twitter(authsettings);
    // con.log("client", client)
    return client;
  }


  function getUserFromId(user_id) {
    con.log("Socialbot getUserFromId", user_id);
    return new Promise(function(fulfill, reject) {
      client.get('users/show', {user_id}, function(error, reply) {
        if (error) {
          reject(error);
        } else {
          fulfill(reply);
        }
      });
    });
  }

  function getUserFromName(screen_name) {
    con.log("Socialbot getUserFromName", screen_name);
    return new Promise(function(fulfill, reject) {
      client.get('users/show', {screen_name}, function(error, reply) {
        if (error) {
          reject(error);
        } else {
          fulfill(reply);
        }
      });
    });
  }

  function getFollowers() {
    // con.log("getFollowers");
    return new Promise(function(fulfill, reject) {
      client.get('followers/ids', function(error, reply) {
        if (error) {
          // con.log("getFollowers error:", error);
          reject(error);
        } else {
          // con.log("getFollowers success:", reply);
          fulfill(reply);
          // var followers = reply.ids; //, randFollower = randIndex(followers);
        }
      });
    });
  }



  function getFollowing(user_id) {
    con.log("getFollowing", user_id);
    return new Promise(function(fulfill, reject) {
      try {
        con.log("getFollowing inside promise", user_id);
        var param = user_id ? { user_id: user_id } : {};
        client.get('friends/ids', param, function(error, reply) {
          if (error) {
            con.log("get friend ids", error);
            reject(error);
          } else {
            var friends = reply.ids;
            if (friends.length) {
              con.log("getFollowing of", user_id, friends.length);//, friends.join(" / "));
              fulfill(friends);
            } else {
              con.log("rejected no friends...")
              reject("NO_FRIENDS");
            }
          }
        })
      } catch(err) {
        con.log("getFollowing err", err);
        reject();
      }
    })
  }

  function getTweets(params) {
    con.log("SocialBot.getTweets attempt", params);
    return new Promise(function(fulfill, reject) {
      if (params.id || params.screen_name) {
        try {
          client.get('statuses/user_timeline', params, function(error, response) {
            if (error) {
              con.log("getTweets error 01", error);
              reject(error);
            } else {
              // con.log("=====================================");
              // con.log("followFriend fulfill response", response);
              // con.log("=====================================");
              // con.log("followFriend fulfill name:", response.name, "location:", response.location, "description:", response.description, "url:", response.url);
              fulfill(response);
            }
          });
        } catch(err) {
          con.log("SocialBot.getTweets error 02", err);
          reject(err);
        }
      } else {
        con.log("SocialBot.getTweets error 03 no user id!");
        reject(null);
      }
    });
  }


  function followFriend(user_id) {
    // con.log("followFriend attempt", user_id);
    return new Promise(function(fulfill, reject) {
      if (user_id) {
        try {
          client.post('friendships/create', {id: user_id}, function(error, response) {
            if (error) {
              con.log("followFriend error 01", error);
              reject(error);
            } else {
              // con.log("=====================================");
              // con.log("followFriend fulfill response", response);
              // con.log("=====================================");
              // con.log("followFriend fulfill name:", response.name, "location:", response.location, "description:", response.description, "url:", response.url);
              fulfill(response);
            }
          });
        } catch(e) {
          con.log("followFriend error 02", e);
          reject(e);
        }
      } else {
        con.log("followFriend no friend to follow!");
        reject(null);
      }
    });
  }


  function unfollowFriend(user_id) {
    // con.log("unfollowFriend", user_id);
    return new Promise(function(fulfill, reject) {
      if (user_id) {
        try {
          client.post('friendships/destroy', {id: user_id}, function(error, response) {
            if (error) {
              con.log("unfollowFriend error 01", error);
              reject(error);
            } else {
              con.log("unfollowFriend success");
              // con.log("unfollowFriend fulfill response", response);
              fulfill(user_id);
            }
          });
        } catch(e) {
          con.log("unfollowFriend error 02", e);
          reject(e);
        }
      } else {
        con.log("unfollowFriend no friend to follow!");
        reject(null);
      }
    });
  }



  function postMedia(image) {
    return new Promise(function(fulfill, reject) {

      con.log("postMedia", image);

      hits ++;
      if (hits > 2) {
        // con.log("too many hits!");
        reject(new Error("more than 5 hits!"));
      }

      con.log("trying client.post!", client);
      try {

        client.post("media/upload", {media: image}, function(error, media, response){
          if (error) {
            con.log("postMedia reject 01", error);
            reject(error);
          } else {
            // con.log("postMedia fulfill!");
            fulfill(media);
          }
        });

      } catch (e) {
        con.log("postMedia reject 03", e);
        reject(e);
      }

    });
  }

  function postTweet(status) {
    return new Promise(function(fulfill, reject) {
      // con.log("postTweet media success", status);
      try {
        client.post("statuses/update", status, function(error, tweet, response){
          if (error) {
            con.log("postTweet reject 02", error);
            reject(error);
          } else {
            // con.log("postTweet fulfill");
            fulfill(tweet);
          }
        });
      } catch (e) {
        con.log("postTweet reject 01", e);
        reject(e);
      }
    })
  }

  return {
    followFriend: followFriend,
    getFollowers: getFollowers,
    getFollowing: getFollowing, // used to be getFriends!
    getFriends: function() { con.warn('getFriends deprecated! use getFollowing')},
    getTweets: getTweets,
    getUserFromId,
    getUserFromName,
    initClient: initClient,
    postMedia: postMedia,
    postTweet: postTweet,
    unfollowFriend: unfollowFriend,
  }
})();
