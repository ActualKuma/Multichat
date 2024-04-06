/*
 * -------------------------------------------------------------------------
 * MultiChat: Combines multiple twitch chats into one for easy 
 * readability for streamers
 *  
 * By ActualKuma #f1d634
 * -------------------------------------------------------------------------
 */

function submitForm(event) {
    event.preventDefault();
    openChats();
    return false;
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
                console.log(`${user} ${extra.username} ${extra.displayName}`);
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

        ComfyJS.onCommand = (user, message, flags, self, extra) => {
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

        ComfyJS.Init(channels[i]);
    }

    var form = document.getElementById("frm1");
    form.style.display = "none";
}