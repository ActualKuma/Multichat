/*
 * -------------------------------------------------------------------------
 * MultiChat: Combines multiple twitch chats into one for easy 
 * readability for streamers
 *  
 * By ActualKuma
 * -------------------------------------------------------------------------
 */

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const openStreams = urlParams.get("openStreams");
const ignoreUsers = urlParams.get("ignoreUsers");
const enable7TV = urlParams.get("enable7TV") == 1;
const enableBTTV = urlParams.get("enableBTTV") == 1;
const enableFFZ = urlParams.get("enableFFZ") == 1;
var ignoredUsers = [];

if(openStreams != null) {
    let input = document.getElementById("streams");
    input.value = openStreams;

    openChats();
}

if(ignoreUsers != null) {
    ignoreUsers = ignoreUsers.toLowerCase();
    ignoredUsers = ignoreUsers.split(" ");
    console.log(ignoredUsers);
}

function submitForm(event) {
    event.preventDefault();
    openChats();
    return false;
}

function openChats() {
    
    var channels = []

    var loadedAssets = {};

    let input = document.getElementById("streams").value;
    channels = input.split(" ");

    var chat = document.querySelector("#chat>ul");

    for(var i = 0; i < channels.length ; i++) {

        var channel = channels[i];

        /**
         * Third Party Emote Integration taken From tmi-emote-pass by smilefx
         * 
         * https://github.com/smilefx/tmi-emote-parse
         */

        loadedAssets[channel] = {
            channel: channel,
            uid: "",
            emotes: [],
            badges: {},
            badgesLoaded: [false, false, false],
            allLoaded: false,
            loaded: {
                "bttv": {
                    global: false,
                    channel: false
                },
                "ffz": {
                    global: false,
                    channel: false
                },
                "7tv": {
                    global: false,
                    channel: false
                }
            }
        }

        if(enableFFZ) {
            fetch(`https://api.frankerfacez.com/v1/room/${channel}`)
            .then(response => response.json())
            .then(body => {
                try {
                    Object.keys(body.sets).forEach(el => {
                        var e = body.sets[el];

                        e.emoticons.forEach(ele => {
                            ele.code = ele.name;
                            ele.type = "ffz";
                            loadedAssets[channel].emotes.push(ele);
                        })
                    })

                    checkLoadedAll(channel, "ffz", "channel", true, args);
                    if (loadedAssets[channel].allLoaded) {
                        loadedAssets[channel].emotes = loadedAssets[channel].emotes.sort(compareLength);
                        exports.events.emit('emotes', {
                            channel: channel
                        });

                        if (loadedAssets[channel].badgesLoaded[2]) {
                            exports.events.emit('loaded', {
                                channel: channel
                            });
                        }
                    }

                } catch (error) {
                   console.log(error);
                }
            });

            fetch(`https://api.frankerfacez.com/v1/set/global`)
            .then(response => response.json())
            .then(body => {
                try {
                    Object.keys(body.sets).forEach(el => {
                        var e = body.sets[el];

                        e.emoticons.forEach(ele => {
                            ele.code = ele.name;
                            ele.type = "ffz";
                            loadedAssets[channel].emotes.push(ele);
                        })
                    })

                    checkLoadedAll(channel, "ffz", "global", true, args);
                    if (loadedAssets[channel].allLoaded) {
                        loadedAssets[channel].emotes = loadedAssets[channel].emotes.sort(compareLength);
                        exports.events.emit('emotes', {
                            channel: channel
                        });

                        if (loadedAssets[channel].badgesLoaded[2]) {
                            exports.events.emit('loaded', {
                                channel: channel
                            });
                        }
                    }
                } catch (error) {
                    console.log(error);

                }

            });

            console.log(`ffz enabled for ${channel}`);
        }


        if(enableBTTV) {
            fetch(`https://api.betterttv.net/3/cached/users/twitch/${uid}`)
            .then(response => response.json())
            .then(body => {
                try {
                    body.channelEmotes.forEach(ele => {
                        ele.type = "bttv";
                        loadedAssets[channel].emotes.push(ele);
                    })

                    body.sharedEmotes.forEach(ele => {
                        ele.type = "bttv";
                        loadedAssets[channel].emotes.push(ele);
                    })

                    checkLoadedAll(channel, "bttv", "channel", true, args);
                    if (loadedAssets[channel].allLoaded) {
                        loadedAssets[channel].emotes = loadedAssets[channel].emotes.sort(compareLength);
                        exports.events.emit('emotes', {
                            channel: channel
                        });

                        if (loadedAssets[channel].badgesLoaded[2]) {
                            exports.events.emit('loaded', {
                                channel: channel
                            });
                        }
                    }
                } catch (error) {
                    console.log(error);

                }
            });

            fetch(`https://api.betterttv.net/3/cached/emotes/global`)
            .then(response => response.json())
            .then(body => {
                try {
                    body.forEach(ele => {
                        ele.type = "bttv";
                        loadedAssets[channel].emotes.push(ele);
                    })

                    checkLoadedAll(channel, "bttv", "global", true, args);
                    if (loadedAssets[channel].allLoaded) {
                        loadedAssets[channel].emotes = loadedAssets[channel].emotes.sort(compareLength);
                        exports.events.emit('emotes', {
                            channel: channel
                        });

                        if (loadedAssets[channel].badgesLoaded[2]) {
                            exports.events.emit('loaded', {
                                channel: channel
                            });
                        }
                    }
                } catch (error) {
                    console.log(error);

                }
            });
            console.log(`bttv enabled for ${channel}`);
        }

        if(enable7TV) {
            fetch(`https://api.7tv.app/v3/users/${channel}`)
            .then(response => response.json())
            .then(body => {
                try {
                    if (body.Status == undefined && body.Status != 404) {
                        if (args["7tv"]["channel"] == true) {
                            fetch(`https://api.7tv.app/v3/users/${channel}/emotes`)
                                .then(response => response.json())
                                .then(body => {
                                    try {
                                        if (body.Status == undefined && body.Status != 404) {
                                            body.forEach(ele => {
                                                ele.code = ele.name;
                                                ele.type = "7tv";
                                                loadedAssets[channel].emotes.push(ele);
                                            })

                                            checkLoadedAll(channel, "7tv", "channel", true, args);
                                            if (loadedAssets[channel].allLoaded) {
                                                loadedAssets[channel].emotes = loadedAssets[channel].emotes.sort(compareLength);
                                                exports.events.emit('emotes', {
                                                    channel: channel
                                                });

                                                if (loadedAssets[channel].badgesLoaded[2]) {
                                                    exports.events.emit('loaded', {
                                                        channel: channel
                                                    });
                                                }
                                            }
                                        } else {
                                            console.log(error);


                                            checkLoadedAll(channel, "7tv", "channel", true, args);
                                        }
                                    } catch (error) {
                                        console.log(error);

                                    }
                                });
                        } else {
                            checkLoadedAll(channel, "7tv", "channel", null, args);
                        }

                        if (args["7tv"]["global"] == true) {
                            fetch(`https://api.7tv.app/v3/emotes/global`)
                                .then(response => response.json())
                                .then(body => {
                                    try {
                                        body.forEach(ele => {
                                            ele.code = ele.name;
                                            ele.type = "7tv";
                                            loadedAssets[channel].emotes.push(ele);
                                        })

                                        checkLoadedAll(channel, "7tv", "global", true, args);
                                        if (loadedAssets[channel].allLoaded) {
                                            loadedAssets[channel].emotes = loadedAssets[channel].emotes.sort(compareLength);
                                            exports.events.emit('emotes', {
                                                channel: channel
                                            });

                                            if (loadedAssets[channel].badgesLoaded[2]) {
                                                exports.events.emit('loaded', {
                                                    channel: channel
                                                });
                                            }
                                        }
                                    } catch (error) {
                                        console.log(error);

                                    }
                                });
                        } else {
                            checkLoadedAll(channel, "7tv", "global", null, args);
                        }
                    } else {
                        console.log(error);


                        checkLoadedAll(channel, "7tv", "channel", true, args);
                        checkLoadedAll(channel, "7tv", "global", true, args);
                    }
                } catch (error) {
                    console.log(error);

                }
            });
            console.log(`7tv enabled for ${channel}`);
        }

        console.log(loadedAssets);

        ComfyJS.onChat = (user, message, flags, self, extra) => {
            if(!ignoreUsers.includes(extra.username)) {
                //Message Container
                var newMessage = document.createElement("li");
                newMessage.style.listStyleType = "none";

                newMessage.id = `${extra.id}`;

                //Username
                var username = document.createElement("div")
                if(user.toLowerCase() != extra.username.toLowerCase()) {
                    username.innerText = `${user}(${extra.username})`;
                } else {
                    username.innerText = `${user}`;
                }
                

                if(extra.userColor == null) {
                    username.style.color = "#6441a5";
                } else {
                    var colour = tinycolor(`${extra.userColor}`);
                    if(colour.getBrightness() < 50) {
                        colour.lighten();
                        username.style.textShadow = "1px 1px 1px #ffffff"
                    }
                    username.style.color = colour.toString();
                }

                //Stream Identifier
                const url = `channel/${extra.channel}.png`;
                fetch(url, { method: "HEAD" }) 
                .then(response => { 
                    if (response.ok) { 
                        var streamBadge = document.createElement("img");
                        streamBadge.src = url;
                        streamBadge.id = "streambadge";
                        streamBadge.title = `${extra.channel}`;
                        newMessage.insertAdjacentElement("afterbegin", streamBadge);
                    } else { 
                        var streamBadge = document.createElement("div");
                        streamBadge.innerText = extra.channel[0] + extra.channel[1];
                        streamBadge.id = "streambadge";
                        streamBadge.style.fontWeight = "bold";
                        newMessage.insertAdjacentElement("afterbegin", streamBadge);
                    } 
                }) 
                .catch(error => { 
                    console.log("An error occurred: ", error); 
                }); 
                

                //Add chat badges
                const badgesJSON = extra.userBadges;
                for(var key in extra.userBadges) {
                    if (key == "subscriber") {
                        if(badgesJSON[key] > 12) {
                            var badge = document.createElement("img");
                            badge.src = `${key}/12.png`
                            badge.id = "badge";
                            badge.title = `${key} ${badgesJSON[key]}`;
                            newMessage.append(badge);
                        } else {
                            var badge = document.createElement("img");
                            badge.src = `${key}/${badgesJSON[key]}.png`
                            badge.id = "badge";
                            badge.title = `${key} ${badgesJSON[key]}`;
                            newMessage.append(badge);
                        }

                    } else {
                        var badge = document.createElement("img");
                        badge.src = `${key}/${badgesJSON[key]}.png`
                        badge.id = "badge";
                        badge.title = `${key} ${badgesJSON[key]}`;
                        newMessage.append(badge);
                    }
                }

                //Message Seperator
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ":" + String.fromCharCode(160);

                //Message
                var messageText = document.createElement("div");
                messageText.innerText = `${message}`;

                //Add emotes to messages
                const messageEmotes = extra.messageEmotes;
                for(var key in extra.messageEmotes) {
                    emoteLocationArray = messageEmotes[key];


                    locations= emoteLocationArray[0].split('-');
                    
                    var x = Number(locations[0]);
                    var y = Number(locations[1]) + 1;
                    var replace = message.slice(x, y);

                    messageText.innerHTML = messageText.innerHTML.replaceAll(replace, `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${key}/default/dark/1.0" id="emote" title="${replace}">`);
                }

                //turn links into hyperlinks
                if(message.includes("http://") || message.includes("https://")) {
                    var messageWords = [];
                    messageWords = message.split(" ");
                    for(var w = 0; w < messageWords.length; w++) {
                        if(messageWords[w].includes("http://") || messageWords[w].includes("https://")) {
                            messageText.innerHTML = messageText.innerHTML.replaceAll(messageWords[w], `<a href="${messageWords[w]}">${messageWords[w]}</a>`);
                        }
                    }
                }

                //Add message text
                newMessage.append(username);
                newMessage.append(userMessageSeperator);
                newMessage.append(messageText);

                chat.append(newMessage);

                //Scroll chat to bottom
                var chatbox = document.getElementById("scrollable")
                chatbox.scrollTop = chatbox.scrollHeight;
            }
        }

        ComfyJS.onCommand = (user, message, flags, self, extra) => {
            if(!ignoreUsers.includes(user)) {
                //Message Container
                var newMessage = document.createElement("li");
                newMessage.style.listStyleType = "none";

                newMessage.id = `${extra.id}`;

                //Username
                var username = document.createElement("div")
                if(user.toLowerCase() != extra.username.toLowerCase()) {
                    username.innerText = `${user}(${extra.username})`;
                } else {
                    username.innerText = `${user}`;
                }
                

                if(extra.userColor == null) {
                    username.style.color = "#6441a5";
                } else {
                    var colour = tinycolor(`${extra.userColor}`);
                    if(colour.getBrightness() < 50) {
                        colour.lighten();
                        username.style.textShadow = "1px 1px 1px #ffffff"
                    }
                    username.style.color = colour.toString();
                }

                //Stream Identifier
                const url = `channel/${extra.channel}.png`;
                fetch(url, { method: "HEAD" }) 
                .then(response => { 
                    if (response.ok) { 
                        var streamBadge = document.createElement("img");
                        streamBadge.src = url;
                        streamBadge.id = "streambadge";
                        streamBadge.title = `${extra.channel}`;
                        newMessage.insertAdjacentElement("afterbegin", streamBadge);
                    } else { 
                        var streamBadge = document.createElement("div");
                        streamBadge.innerText = extra.channel[0] + extra.channel[1];
                        streamBadge.id = "streambadge";
                        streamBadge.style.fontWeight = "bold";
                        newMessage.insertAdjacentElement("afterbegin", streamBadge);
                    } 
                }) 
                .catch(error => { 
                    console.log("An error occurred: ", error); 
                }); 
                

                //Add chat badges
                const badgesJSON = extra.userBadges;
                for(var key in extra.userBadges) {
                    if (key == "subscriber") {
                        if(badgesJSON[key] > 12) {
                            var badge = document.createElement("img");
                            badge.src = `${key}/12.png`
                            badge.id = "badge";
                            badge.title = `${key} ${badgesJSON[key]}`;
                            newMessage.append(badge);
                        } else {
                            var badge = document.createElement("img");
                            badge.src = `${key}/${badgesJSON[key]}.png`
                            badge.id = "badge";
                            badge.title = `${key} ${badgesJSON[key]}`;
                            newMessage.append(badge);
                        }

                    } else {
                        var badge = document.createElement("img");
                        badge.src = `${key}/${badgesJSON[key]}.png`
                        badge.id = "badge";
                        badge.title = `${key} ${badgesJSON[key]}`;
                        newMessage.append(badge);
                    }
                }

                //Message Seperator
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ":" + String.fromCharCode(160);

                //Message
                var messageText = document.createElement("div");
                messageText.innerText = `!${message}`;

                //Add emotes to messages
                const messageEmotes = extra.messageEmotes;
                for(var key in extra.messageEmotes) {
                    emoteLocationArray = messageEmotes[key];


                    locations= emoteLocationArray[0].split('-');
                    
                    var x = Number(locations[0]);
                    var y = Number(locations[1]) + 1;
                    var replace = message.slice(x, y);

                    messageText.innerHTML = messageText.innerHTML.replaceAll(replace, `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${key}/default/dark/1.0" id="emote" title="${replace}">`);
                }

                //turn links into hyperlinks
                if(message.includes("http://") || message.includes("https://")) {
                    var messageWords = [];
                    messageWords = message.split(" ");
                    for(var w = 0; w < messageWords.length; w++) {
                        if(messageWords[w].includes("http://") || messageWords[w].includes("https://")) {
                            messageText.innerHTML = messageText.innerHTML.replaceAll(messageWords[w], `<a href="${messageWords[w]}">${messageWords[w]}</a>`);
                        }
                    }
                }

                //Add message text
                newMessage.append(username);
                newMessage.append(userMessageSeperator);
                newMessage.append(messageText);

                chat.append(newMessage);

                //Scroll chat to bottom
                var chatbox = document.getElementById("scrollable")
                chatbox.scrollTop = chatbox.scrollHeight;
            }
        }

        ComfyJS.onMessageDeleted = (id, extra) => {
            var todelete = document.getElementById(`${id}`);
            todelete.style.display = "none";
        }

        ComfyJS.Init(channels[i]);
    }

    var form = document.getElementById("frm1");
    form.style.display = "none";
}

function checkLoadedAll(channel, type, extra, value, args) {
    if (args[type][extra] == false && value == null) {
        loadedAssets[channel].loaded[type][extra] = null;
    }
    if (args[type][extra] == true && loadedAssets[channel].loaded[type][extra] == false && value == true) {
        loadedAssets[channel].loaded[type][extra] = true;
    }

    var trueVals = [];
    Object.keys(loadedAssets[channel].loaded).forEach((e, ind) => {
        e = loadedAssets[channel].loaded[e];
        var allTrue = true;
        Object.keys(e).forEach(ele => {
            ele = e[ele];
            if (ele == false) {
                allTrue = false;
            }
        })

        trueVals.push(allTrue);
    });

    loadedAssets[channel].allLoaded = !trueVals.includes(false);
    return !trueVals.includes(false);

}