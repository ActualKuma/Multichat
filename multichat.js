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

                console.log(extra.userBadges)

                var messageText = document.createElement("div");
                messageText.innerText = `: ${message}`;
                //newMessage.innerText = `${user}: ${message}`;
                newMessage.append(username);
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