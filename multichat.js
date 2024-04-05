function openChats() {
    var channels = []

    let input = document.getElementById("streams").value;
    channels = input.split(" ");

    var chat = document.querySelector("#chat>ul");

    for(var i = 0; i < channels.length ; i++) {
        ComfyJS.onChat = (user, message, flags, self, extra) => {
                var newMessage = document.createElement("li");
                newMessage.style.listStyleType = "none";
                var username = document.createElement("div")
                username.innerText = `${user}`;
                username.style.color = `${extra.userColor}`;

                if(extra.userColor == null) {
                    username.style.color = "#6441a5";
                }

                var streamBadge = document.createElement("img");
                streamBadge.src = `channel/${extra.channel}.png`;
                streamBadge.id = "badge";

                console.log(extra.userBadges);
                
                var userMessageSeperator = document.createElement("div");
                userMessageSeperator.innerText = ": ";

                var messageText = document.createElement("div");
                messageText.innerText = `${message}`;
                //newMessage.innerText = `${user}: ${message}`;
                newMessage.append(streamBadge);

                const badgesJSON = extra.userBadges;
                for(var key in extra.userBadges) {
                    if(key == "bits" || key == "broadcaster" || key == "founder" || key == "moderator" || key == "partner" || key == "sub-gift-leader" || key == "sub-gift-leader" || key == "sub-gifter") {
                        var badge = document.createElement("img");
                        badge.src = `${key}/${badgesJSON[key]}.png`
                        badge.id = "badge";
                        newMessage.append(badge);
                    } else if (key == "subscriber") {
                        if(badgesJSON[key] > 12) {
                            var badge = document.createElement("img");
                            badge.src = `${key}/12.png`
                            badge.id = "badge";
                            newMessage.append(badge);
                        } else {
                            var badge = document.createElement("img");
                            badge.src = `${key}/${badgesJSON[key]}.png`
                            badge.id = "badge";
                            newMessage.append(badge);
                        }

                    }
                }


                newMessage.append(username);
                newMessage.append(userMessageSeperator);
                newMessage.append(messageText);

                chat.append(newMessage);

                var chatbox = document.getElementById("scrollable")
                chatbox.scrollTop = chatbox.scrollHeight;
        }

        ComfyJS.Init(channels[i]);
    }

    var form = document.getElementById("frm1");
    form.style.display = "none";
}