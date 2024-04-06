/*
 * -------------------------------------------------------------------------
 * MultiChat: Combines multiple twitch chats into one for easy 
 * readability for streamers
 *  
 * By ActualKuma
 * -------------------------------------------------------------------------
 */
const clientId = "6v8y5ouq26qh6fnqy7qrpsnl9qifcp";
const baseUrl = window.location.origin;

function login() {
    ComfyTwitch.Login( clientId, `https://multichat.dev`, [ "user:read:email" ] );
    var form2 = document.getElementById("frm2");
    form2.style.display = "none";
}

function openChats() {
    
    var channels = []

    let input = document.getElementById("streams").value;
    channels = input.split(" ");

    var chat = document.querySelector("#chat>ul");

    for(var i = 0; i < channels.length ; i++) {
        ComfyJS.onChat = (user, message, flags, self, extra) => {
                //Message Container
                var newMessage = document.createElement("li");
                newMessage.style.listStyleType = "none";

                //Username
                var username = document.createElement("div")
                username.innerText = `${user}`;
                username.style.color = `${extra.userColor}`;

                if(extra.userColor == null) {
                    username.style.color = "#6441a5";
                }

                //Stream Identifier
                ComfyTwitch.Check()
                .then( result => {
                    if( result ) {
                        console.log("logged in");
                        getUserAvatar(extra.channel);
                    }
                    else {
                        console.log("logged out")
                        var streamBadge = document.createElement("img");
                        streamBadge.src = `channel/${extra.channel}.png`;
                        streamBadge.id = "streambadge";
                        streamBadge.title = `${extra.channel}`;
                        newMessage.append(streamBadge);
                    }
                });

                //Add chat badges
                const badgesJSON = extra.userBadges;
                for(var key in extra.userBadges) {
                    if(key == "bits" || key == "broadcaster" || key == "founder" || key == "moderator" || key == "partner" || key == "sub-gift-leader" || key == "sub-gift-leader" || key == "sub-gifter" || key == "vip") {
                        var badge = document.createElement("img");
                        badge.src = `${key}/${badgesJSON[key]}.png`
                        badge.id = "badge";
                        badge.title = `${key} ${badgesJSON[key]}`;
                        newMessage.append(badge);
                    } else if (key == "subscriber") {
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

        ComfyJS.Init(channels[i]);
    }

    var form = document.getElementById("frm1");
    form.style.display = "none";
}

async function getUserAvatar(streamer) {
    let streamerProfile = await ComfyTwitch.getUser(clientId, streamer);

    console.log(streamerProfile);

    return streamerProfile;
}