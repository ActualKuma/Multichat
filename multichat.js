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
var chatbox = document.getElementById("scrollable");
var initialHeight = chatbox.offsetHeight;
var streamerInfo = {};
var userInfo = {};

var link = document.querySelector("link[rel~='icon']");
if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
}
var icon_url = getRandomIcon();
link.href = icon_url;
var credits = document.getElementById("credits");
credits.innerHTML = `<img src="${icon_url}" id="logo">` + credits.innerHTML;

chatbox.addEventListener("resize", (event) => {
    initialHeight = chatbox.offsetHeight;
})

if(openStreams != null) {
    let input = document.getElementById("streams");
    input.value = openStreams;
    openChats();
} else {
    checkIgnore();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomIcon() {
    switch(getRandomInt(16)) {
        case 0:
            return "/Icons/multichat1.png";
        case 1:
            return "/Icons/multichat2.png";
        case 2:
            return "/Icons/multichat3.png";
        case 3:
            return "/Icons/multichat4.png";
        case 4:
            return "/Icons/multichat5.png";
        case 5:
            return "/Icons/multichat6.png";
        case 6:
            return "/Icons/multichat7.png";
        case 7:
            return "/Icons/multichat8.png";
        case 8:
            return "/Icons/multichat9.png";
        case 9:
            return "/Icons/multichat10.png";
        case 10:
            return "/Icons/multichat11.png";
        case 11:
            return "/Icons/multichat12.png";
        case 12:
            return "/Icons/multichat13.png";
        case 13:
            return "/Icons/multichat14.png";
        case 14:
            return "/Icons/multichat15.png";
        case 15:
            return "/Icons/multichat16.png";
    }
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
    var url = "";
    if(window.location.hostname == "localhost"){ 
        url = "http://localhost:8080";
    } else {
        url = "https://multichat.dev";
    }
    ComfyTwitch.Login( "lkcbakp0dx86jr3kvf0nazy13ubbdd", `${url}`, ["channel:read:redemptions", "user:read:email", "user:write:chat", "channel:moderate", "user:read:follows", "moderator:manage:banned_users", "moderation:read"] );
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

    document.title = `multichat.dev (${streams})`
}

async function chatV2() {
    var channels = []
    var streams = null;

    let input = document.getElementById("streams").value;
    channels = input.split(" ");

    var chat = document.querySelector("#chat>ul");

    let currUser = await ComfyTwitch.GetCurrentUser(clientId);

    userInfo = currUser;

    let ffzEnabled = document.getElementById("ffz").checked;
    let bttvEnabled = document.getElementById("bttv").checked;
    let seventvEnabled = document.getElementById("7tv").checked;
    let chatEnabled = document.getElementById("enableChat").checked;

    if(chatEnabled) {
        chatbox.style.height = "88%";
        document.getElementById("textChat").style.display = "block";
        initialHeight = chatbox.offsetHeight;
    }

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

        var streamsDropdown = document.getElementById("streamsDropdown");
        streamsDropdown.innerHTML = `${streamsDropdown.innerHTML}<option value=${channels[i]}>${channels[i]}</option>`
    }
        
    ComfyJS.onChat = (user, message, flags, self, extra) => {
        if(!ignoredUsers.includes(user.toLowerCase())) {
            //Message Container
            var newMessage = document.createElement("li");
            newMessage.style.listStyleType = "none";

            newMessage.id = `${extra.id}`;

             //Username
             var username = document.createElement("button")
             if(user.toLowerCase() != extra.username.toLowerCase()) {
                 username.innerText = `${user}(${extra.username})`;
             } else {
                 username.innerText = `${user}`;
             }
             username.value = `${user} ${extra.channel}`;
             username.classList.add("btn");

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


            var chatbox = document.getElementById("scrollable");
            var prevHeight = chatbox.scrollHeight;

            chat.append(newMessage);


            //Scroll chat to bottom=
            if(initialHeight == (prevHeight - chatbox.scrollTop)) {
                chatbox.scrollTop = chatbox.scrollHeight;
            }
        }
    }

    ComfyJS.onCommand = (user, message, flags, self, extra) => {
        if(!ignoredUsers.includes(user.toLowerCase())) {
            //Message Container
            var newMessage = document.createElement("li");
            newMessage.style.listStyleType = "none";

            newMessage.id = `${extra.id}`;

            //Username
            var username = document.createElement("button")
            if(user.toLowerCase() != extra.username.toLowerCase()) {
                username.innerText = `${user}(${extra.username})`;
            } else {
                username.innerText = `${user}`;
            }
            username.value = `${user} ${extra.channel}`;
            username.classList.add("btn");

            

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

            var chatbox = document.getElementById("scrollable");
            var prevHeight = chatbox.scrollHeight;

            chat.append(newMessage);


            //Scroll chat to bottom=
            if(initialHeight == (prevHeight - chatbox.scrollTop)) {
                chatbox.scrollTop = chatbox.scrollHeight;
            }
        }
    }

    ComfyJS.onMessageDeleted = (id, extra) => {
        var todelete = document.getElementById(`${id}`);
        todelete.style.display = "none";
    }



    ComfyJS.Init(currUser["login"], null, channels);
    

    document.title = `multichat.dev (${streams})`
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

function sendTwitchMessage() {
    let messageInput = document.getElementById("textInput");
    let messageText = messageInput.value;
    let sender_id = userInfo.id;
    let broadcaster = document.getElementById("streamsDropdown").value;
    let broadcaster_id = streamerInfo[broadcaster]["id"];

    ComfyTwitch.SendMessage(clientId, broadcaster_id, sender_id, messageText);
    
    messageInput.value = "";
}

document.querySelector('#scrollable').addEventListener('click', async event => {
    let target = event.target;
    if (target.matches('button')) {
        let values = target.value;
        var valuesArray = [];
        valuesArray = values.split(" ");
        var value = valuesArray[0];
        var channelId = streamerInfo[valuesArray[1]].id;

        let userInformation = await ComfyTwitch.GetUser(clientId, `${value}`);

        let userInfo = document.getElementById("userInfo");
        if(userInfo != null) {
            userInfo.innerHTML = "";
            userInfo.remove();
        }
        userInfo = document.createElement("table");
        userInfo.id = "userInfo"

        var tr = document.createElement("tr");

        var userHeading = document.createElement("div");
        userHeading.classList.add("userInfoElement");

        const url = `${userInformation.profile_image_url}`;
        var userPfp = document.createElement("img");
        userPfp.src = url;
        userPfp.id = "userInfoPic";
        userPfp.title = `${userInformation.display_name}`;
        userPfp.style.margin = "auto"
        userHeading.append(userPfp);


        var username = document.createElement("td");
        username.innerHTML = `<h2><a href="https://twitch.tv/${userInformation.login}" class="kuma">${userInformation.display_name}</a></h2>`;
        username.style.textAlign = "centre";
        username.style.left = "50%";
        userHeading.append(username);

        tr.append(userHeading);

        userInfo.append(tr);
        var tr = document.createElement("tr");

        var timeCreated = document.createElement("td");
        timeCreated.innerHTML = `<div class="userInfoElement">Date Created: ${convertDateTime(userInformation.created_at)}</div>`;
        tr.append(timeCreated);

        userInfo.append(tr);

        var isMod = document.getElementById("enableMod").checked;
        if(isMod) {
            var tr = document.createElement("tr");

            let currentUser = await ComfyTwitch.GetCurrentUser(clientId);
            currentUserId = currentUser.id;
     
            var ban = document.createElement("button");
            ban.classList.add("btn");
            ban.classList.add("userInfoButton");
            ban.innerText = "Ban User"
            ban.style.paddingRight = "5px";
            ban.onclick = await function() {
                ComfyTwitch.BanUser(clientId, channelId, currentUserId, userInformation.id,);
            };
            tr.append(ban);


            var timeout = document.createElement("button");
            timeout.innerText = "Timeout User"
            timeout.classList.add("btn");
            timeout.classList.add("userInfoButton");
            timeout.style.paddingRight = "5px";
            timeout.onclick = await function() {
                ComfyTwitch.TimeoutUser(clientId, channelId, currentUserId, userInformation.id, "500")
            };
            tr.append(timeout);

            var unban = document.createElement("button");
            unban.classList.add("btn");
            unban.classList.add("userInfoButton");
            unban.innerText = "Unban User"
            unban.onclick = await function() {
                ComfyTwitch.UnbanUser(clientId, channelId, currentUserId, userInformation.id,);
            };
            tr.append(unban);
            


            userInfo.append(tr);
        }

        document.body.appendChild(userInfo);
    } else {
        let userInfo = document.getElementById("userInfo");
        if(userInfo != null) {
            userInfo.innerHTML = "";
            userInfo.remove();
        }
    }
});

function convertDateTime(dateTime) {
    var date = new Date(dateTime);
    return date.toDateString();
}