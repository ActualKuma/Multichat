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
const oauthToken = new URLSearchParams(location.hash.replace("#", "")).get("access_token");
const clientId = "lkcbakp0dx86jr3kvf0nazy13ubbdd";
var ignoredUsers = [];

if(openStreams != null) {
    let input = document.getElementById("streams");
    input.value = openStreams;
    openChats();
} else {
    checkIgnore();
}

ComfyTwitch.Check()
    .then(async result => {
        if( result ) {
            let loginButton = document.getElementById("login");
            loginButton.style.display = "none";
        }
        else {
            let logoutButton = document.getElementById("logout");
            logoutButton.style.display = "none";
            let thirdPartySupportElements = document.getElementsByClassName("onlogged");
            for (var i = 0; i < thirdPartySupportElements.length; i++ ) {
                thirdPartySupportElements[i].style.display = "none";
            }
        }
    });

function submitForm(event) {
    event.preventDefault();
    checkIgnore();
    openChats();
    return false;
}

function twitchLogin() {
    ComfyTwitch.Login( "lkcbakp0dx86jr3kvf0nazy13ubbdd", `https://multichat.dev`, [ "user:read:email" ] );
}

function twitchLogout() {
    ComfyTwitch.Logout();
    window.location.reload();
}

function openChats() {
    setIgnore();

    ComfyTwitch.Check()
    .then(async result => {
        if( result ) {
            console.log("MultichatV2")
            chatV2();
        }
        else {
            console.log("MultichatV1")
            chatV1();
        }
    });

    

    document.title = `multichat.dev (${streams})`

    var form = document.getElementById("frm1");
    form.style.display = "none";
}

function checkIgnore() {
    if(ignoreUsers != null) {
        let input = document.getElementById("ignore");
        input.value = ignoreUsers;
    }
}

function setIgnore() {
    let input = document.getElementById("ignore").value;
    ignoredUsers = input.split(" ");
    console.log(`Ignoring users: ${input}`);
}

function chatV1() {
    var channels = []
    var streams = null;

    let input = document.getElementById("streams").value;
    channels = input.split(" ");

    var chat = document.querySelector("#chat>ul");

    for(var i = 0; i < channels.length ; i++) {
        if(streams == null) {
            streams = `${channels[i]}`;
        } else {
            streams = `${streams}, ${channels[i]}`;
        }
        
        ComfyJS.onChat = (user, message, flags, self, extra) => {
            if(!ignoredUsers.includes(user.toLowerCase())) {
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
                username.classList.add("inline");

                //Stream Identifier
                const url = `channel/${extra.channel}.png`;
                fetch(url, { method: "HEAD" }) 
                .then(response => { 
                    if (response.ok) { 
                        var streamBadge = document.createElement("img");
                        streamBadge.src = url;
                        streamBadge.id = "streambadge";
                        streamBadge.title = `${extra.channel}`;
                        streamBadge.classList.add("inline");
                        newMessage.insertAdjacentElement("afterbegin", streamBadge);
                    } else { 
                        var streamBadge = document.createElement("div");
                        streamBadge.innerText = extra.channel[0] + extra.channel[1];
                        streamBadge.id = "streambadge";
                        streamBadge.style.fontWeight = "bold";
                        streamBadge.classList.add("inline");
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
                            badge.classList.add("inline");
                            newMessage.append(badge);
                        } else {
                            var badge = document.createElement("img");
                            badge.src = `${key}/${badgesJSON[key]}.png`
                            badge.id = "badge";
                            badge.title = `${key} ${badgesJSON[key]}`;
                            badge.classList.add("inline");
                            newMessage.append(badge);
                        }

                    } else {
                        var badge = document.createElement("img");
                        badge.src = `${key}/${badgesJSON[key]}.png`
                        badge.id = "badge";
                        badge.title = `${key} ${badgesJSON[key]}`;
                        badge.classList.add("inline");
                        newMessage.append(badge);
                    }
                }

                //Message Seperator
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ":" + String.fromCharCode(160);
                userMessageSeperator.classList.add("inline");

                //Message
                var messageText = document.createElement("div");
                messageText.innerText = `${message}`;
                messageText.classList.add("inline");

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
            if(!ignoredUsers.includes(user.toLowerCase())) {
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
                username.classList.add("inline");

                //Stream Identifier
                const url = `channel/${extra.channel}.png`;
                fetch(url, { method: "HEAD" }) 
                .then(response => { 
                    if (response.ok) { 
                        var streamBadge = document.createElement("img");
                        streamBadge.src = url;
                        streamBadge.id = "streambadge";
                        streamBadge.title = `${extra.channel}`;
                        streamBadge.classList.add("inline");
                        newMessage.insertAdjacentElement("afterbegin", streamBadge);
                    } else { 
                        var streamBadge = document.createElement("div");
                        streamBadge.innerText = extra.channel[0] + extra.channel[1];
                        streamBadge.id = "streambadge";
                        streamBadge.style.fontWeight = "bold";
                        streamBadge.classList.add("inline");
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
                            badge.classList.add("inline");
                            newMessage.append(badge);
                        } else {
                            var badge = document.createElement("img");
                            badge.src = `${key}/${badgesJSON[key]}.png`
                            badge.id = "badge";
                            badge.title = `${key} ${badgesJSON[key]}`;
                            badge.classList.add("inline");
                            newMessage.append(badge);
                        }

                    } else {
                        var badge = document.createElement("img");
                        badge.src = `${key}/${badgesJSON[key]}.png`
                        badge.id = "badge";
                        badge.title = `${key} ${badgesJSON[key]}`;
                        badge.classList.add("inline");
                        newMessage.append(badge);
                    }
                }

                //Message Seperator
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ":" + String.fromCharCode(160);
                userMessageSeperator.classList.add("inline");

                //Message
                var messageText = document.createElement("div");
                messageText.innerText = `!${message}`;
                messageText.classList.add("inline");

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
}

async function chatV2() {
    var channels = []
    var streams = null;

    let input = document.getElementById("streams").value;
    channels = input.split(" ");

    var chat = document.querySelector("#chat>ul");

    var streamerInfo = {};

    for(var i = 0; i < channels.length ; i++) {
        var channelName = channels[i].toLowerCase();
        let user = await ComfyTwitch.GetUser(clientId, channelName); 
        streamerInfo[channelName] = {
            id: user["id"],
            profile_image_url: user["profile_image_url"],
            emotes: [],
            badges: []
        };

        let badges = await ComfyTwitch.GetBadges(clientId, streamerInfo[channelName].id);
        let globalBadges = await ComfyTwitch.GetBadgesGlobal(clientId);

        addBadges(badges, globalBadges, streamerInfo, channelName);

        let ffzEnabled = document.getElementById("ffz").checked;
        let bttvEnabled = document.getElementById("bttv").checked;
        let seventvEnabled = document.getElementById("7tv").checked;

        if(seventvEnabled) {
            load7TV(streamerInfo);
        }

        if(ffzEnabled) {
            loadFFZ(streamerInfo);
        }

        if(bttvEnabled) {
            loadBTTV(streamerInfo);
        }

        console.log(streamerInfo);

        if(streams == null) {
            streams = `${channels[i]}`;
        } else {
            streams = `${streams}, ${channels[i]}`;
        }
        
        ComfyJS.onChat = (user, message, flags, self, extra) => {
            if(!ignoredUsers.includes(user.toLowerCase())) {
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
                username.classList.add("inline");

                //Stream Identifier
                var infoForStreamer = streamerInfo[extra.channel];
                const url = `${infoForStreamer["profile_image_url"]}`;
                var streamBadge = document.createElement("img");
                streamBadge.src = url;
                streamBadge.id = "streambadge";
                streamBadge.title = `${extra.channel}`;
                streamBadge.classList.add("inline");
                newMessage.insertAdjacentElement("afterbegin", streamBadge);
                
                

                //Add chat badges
                const badgesJSON = extra.userBadges;
                for(var key in extra.userBadges) {
                    for(var index in infoForStreamer.badges) {
                        var badge = infoForStreamer.badges[index];
                        if(badge.set_id == key) {
                            var versions = badge.versions;
                            for(var index2 in versions) {
                                if(versions[index2].id == badgesJSON[key]) {
                                    var badge = document.createElement("img");
                                    badge.src = versions[index2].image_url;
                                    badge.id = "badge";
                                    badge.title = `${key} ${badgesJSON[key]}`;
                                    badge.classList.add("inline");
                                    newMessage.append(badge);
                                }
                            }
                        }
                    }
                }

                //Message Seperator
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ":" + String.fromCharCode(160);
                userMessageSeperator.classList.add("inline");

                //Message
                var messageText = document.createElement("div");
                messageText.innerText = `${message}`;
                messageText.classList.add("inline");

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

                //add 3rd party emotes
                if(ffzEnabled || seventvEnabled || bttvEnabled) {
                    var messageWords = [];
                    messageWords = messageText.innerHTML.split(" ");
                    for (var code in infoForStreamer.emotes) {
                        var emote = infoForStreamer.emotes[code];
                        if(messageWords.includes(emote.name)) {
                            if(emote.type == "7tv") {
                                messageText.innerHTML = messageText.innerHTML.replaceAll(emote.name, `<img src="${emote.data.host.url}/1x.webp" id="emote" title="${emote.name}">`);
                            } else if (emote.type == "ffz") {
                                messageText.innerHTML = messageText.innerHTML.replaceAll(emote.name, `<img src="${emote.urls[1]}" id="emote" title="${emote.name}">`);
                            } else if (emote.type == "bttv") {
                                messageText.innerHTML = messageText.innerHTML.replaceAll(emote.name, `<img src="https://cdn.betterttv.net/emote/${emote.id}/1x.webp" id="emote" title="${emote.name}">`);
                            }
                            
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
            if(!ignoredUsers.includes(user.toLowerCase())) {
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
                username.classList.add("inline");

                //Stream Identifier
                var infoForStreamer = streamerInfo[extra.channel];
                const url = `${infoForStreamer["profile_image_url"]}`;
                var streamBadge = document.createElement("img");
                streamBadge.src = url;
                streamBadge.id = "streambadge";
                streamBadge.title = `${extra.channel}`;
                streamBadge.classList.add("inline");
                newMessage.insertAdjacentElement("afterbegin", streamBadge);
                

                ///Add chat badges
                const badgesJSON = extra.userBadges;
                for(var key in extra.userBadges) {
                    for(var index in infoForStreamer.badges) {
                        var badge = infoForStreamer.badges[index];
                        if(badge.set_id == key) {
                            var versions = badge.versions;
                            for(var index2 in versions) {
                                if(versions[index2].id == badgesJSON[key]) {
                                    var badge = document.createElement("img");
                                    badge.src = versions[index2].image_url;
                                    badge.id = "badge";
                                    badge.title = `${key} ${badgesJSON[key]}`;
                                    badge.classList.add("inline");
                                    newMessage.append(badge);
                                }
                            }
                        }
                    }
                }

                //Message Seperator
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ":" + String.fromCharCode(160);
                userMessageSeperator.classList.add("inline");

                //Message
                var messageText = document.createElement("div");
                messageText.innerText = `!${message}`;
                messageText.classList.add("inline");

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

                //add 3rd party emotes
                if(ffzEnabled || seventvEnabled || bttvEnabled) {
                    var messageWords = [];
                    messageWords = messageText.innerHTML.split(" ");
                    for (var code in infoForStreamer.emotes) {
                        var emote = infoForStreamer.emotes[code];
                        if(messageWords.includes(emote.name)) {
                            if(emote.type == "7tv") {
                                messageText.innerHTML = messageText.innerHTML.replaceAll(emote.name, `<img src="${emote.data.host.url}/1x.webp" id="emote" title="${emote.name}">`);
                            } else if (emote.type == "ffz") {
                                messageText.innerHTML = messageText.innerHTML.replaceAll(emote.name, `<img src="${emote.urls[1]}" id="emote" title="${emote.name}">`);
                            } else if (emote.type == "bttv") {
                                messageText.innerHTML = messageText.innerHTML.replaceAll(emote.name, `<img src="https://cdn.betterttv.net/emote/${emote.id}/1x.webp" id="emote" title="${emote.name}">`);
                            }
                            
                        }  
                    }
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
}

function loadFFZ(streamerInfo) {
    for(var channel in streamerInfo) {
        fetch(`https://api.frankerfacez.com/v1/room/${channel}`)
        .then(response => response.json())
        .then(body => {
            try {
                Object.keys(body.sets).forEach(el => {
                    var e = body.sets[el];

                    e.emoticons.forEach(ele => {
                        ele.code = ele.name;
                        ele.type = "ffz";
                        if(!checkIfInEmoteList(streamerInfo, channel, ele)) {
                            streamerInfo[channel].emotes.push(ele);
                        }
                    })
                })

            } catch (error) {
                console.log(error)
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
                        if(!checkIfInEmoteList(streamerInfo, channel, ele)) {
                            streamerInfo[channel].emotes.push(ele);
                        }
                    })
                })

            } catch (error) {
                console.log(error)

            }

        });
    }
}

function loadBTTV(streamerInfo) {
    for(var channel in streamerInfo) {
        var id = streamerInfo[channel]["id"];
        fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`)
        .then(response => response.json())
        .then(body => {
            try {
                body.channelEmotes.forEach(ele => {
                    ele.type = "bttv";
                    if(!checkIfInEmoteList(streamerInfo, channel, ele)) {
                        streamerInfo[channel].emotes.push(ele);
                    }
                })

                body.sharedEmotes.forEach(ele => {
                    ele.type = "bttv";
                    if(!checkIfInEmoteList(streamerInfo, channel, ele)) {
                        streamerInfo[channel].emotes.push(ele);
                    }
                })

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
                    if(!checkIfInEmoteList(streamerInfo, channel, ele)) {
                        streamerInfo[channel].emotes.push(ele);
                    }
                })

            } catch (error) {
                console.log(error);

            }
        });
    }
}

function load7TV(streamerInfo) {
    for(var channel in streamerInfo) {
        var id = streamerInfo[channel]["id"];
        
        fetch(`https://7tv.io/v3/users/twitch/${id}`)
        .then(response => response.json())
        .then(body => {
            try {
                if (body.Status == undefined && body.Status != 404) {
                    var emote_set = body["emote_set"]["emotes"];
                    for(var emote in emote_set) {
                        emote_set[emote].code = emote_set[emote].name;
                        emote_set[emote].type = "7tv";
                        if(!checkIfInEmoteList(streamerInfo, channel, emote_set[emote])) {
                            streamerInfo[channel].emotes.push(emote_set[emote]);
                        }
                    }
                    
                } else {
                    console.log('error', {
                        channel: channel,
                        error: "Failed to load 7TV channel emotes for " + channel
                    });
                }
            } catch (error) {
                console.log(error);

            }
        });
        
        fetch(`https://7tv.io/v3/emote-sets/global`)
        .then(response => response.json())
        .then(body => {
            try {
                var emote_set = body["emotes"];
                for(var emote in emote_set) {
                    emote_set[emote].code = emote_set[emote].name;
                    emote_set[emote].type = "7tv";
                    if(!checkIfInEmoteList(streamerInfo, channel, emote_set[emote])) {
                        streamerInfo[channel].emotes.push(emote_set[emote]);
                    }
                }

            } catch (error) {
                console.log(error);

            }
        });

    }
    
}

function checkIfInEmoteList(streamerInfo, channel, emote) {
    var emoteList = streamerInfo[channel]["emotes"];
    for(var loadedEmote in emoteList) {
        if(emoteList[loadedEmote]["code"] == emote["code"]) {
            return true;
        }
    }
    return false;
}

function addBadges(badges, global, streamerInfo, channel) {
    var data = badges.data;
    var datag = global.data;
    for (var index in data) {
        var bSet = data[index];
        var badgeSet = {
            "set_id": `${bSet.set_id}`,
            "versions": []
        }
        for(var index2 in bSet.versions) {
            var badge = {
                "id": `${bSet.versions[index2].id}`,
                "image_url": `${bSet.versions[index2].image_url_1x}`
            }
            badgeSet.versions.push(badge);
        }
        streamerInfo[channel].badges.push(badgeSet);
    }
    for (var index in datag) {
        var bSet = datag[index];
        var badgeSet = {
            "set_id": `${bSet.set_id}`,
            "versions": []
        }
        var notInBadges = true;
        for(var index3 in streamerInfo[channel].badges) {
            if(streamerInfo[channel].badges[index3].set_id == badgeSet.set_id) {
                notInBadges = false;
                break;
            }
        }
        if(notInBadges) {
            for(var index2 in bSet.versions) {
                var badge = {
                    "id": `${bSet.versions[index2].id}`,
                    "image_url": `${bSet.versions[index2].image_url_1x}`
                }
                badgeSet.versions.push(badge);
            }
            streamerInfo[channel].badges.push(badgeSet);
        }
    }
}