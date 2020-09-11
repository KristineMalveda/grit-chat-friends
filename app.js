//self invoked anonymous function

//Global variable
(function () {
  //wrap application in a function

  let peer = null;
  let conn = null;
  let mediaConn = null;

  const consoleLog = (e) => {
    console.log(e);
  };
  //handle peer events
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };
  const peerOnError = (error) => {
    console.log(error);
  };

  const peerOnConnection = (dataConnection) => {
    conn && conn.close();
    conn = dataConnection;
    console.log(conn);

    conn.on("data", (data) => {
      console.log(data);
      printMessage(data, "them");
    });

    //dispatch custom event here. Event name: 'peer-change'
    const event = new CustomEvent("peer-changed", {
      detail: {
        peerId: conn.peer,
      },
    });
    document.dispatchEvent(event);
  };

  //on peer event "call" : when the'yre calling you
  const peerOnCall = (incomingCall) => {
    // if(confirm(`Answer Call from ${incomingCall.peer}?`)) {
    mediaConn && mediaConn.close();
    //Answering incoming call
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((myStream) => {
        mediaConn = incomingCall;
        incomingCall.answer(myStream);
        mediaConn.on("stream", mediaConnOnStream);
      });
    //}
  };

  //*Location object : random id if the hash location is not defined
  const myPeerId = location.hash.slice(1);
  console.log(myPeerId);

  //Create a peer object to connect peer server
  peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        {
          url: ["stun:eu-turn7.xirsys.com"],
        },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          url: "turn:eu-turn7.xirsys.com:80?transport=udp",
        },
      ],
    },
  });

  //Handle peer events
  peer.on("open", peerOnOpen);

  //feltestning
  peer.on("error", peerOnError);

  //connection
  peer.on("connection", peerOnConnection);

  //call connection
  peer.on("call", peerOnCall);

  //connect to peer
  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent;
    //kollar om conn är satt eller falsy (undefined/null/false)
    if (conn) conn.close();
    conn = peer.connect(peerId);
    console.log(peerId);
    conn.on("open", () => {
      console.log("connection open");
      //create a custom event
      const event = new CustomEvent("peer-changed", {
        detail: {
          peerId: peerId,
        },
      });
      document.dispatchEvent(event);

      conn.on("data", (data) => {
        console.log(data);
        printMessage(data, "them");
      });
    });
    conn.on("error", consoleLog);

    //update video subtext
    const video = document.querySelector(".video-container.them");
    video.querySelector(".name").innerText = peerId;
  };

  //Implement print message function
  let printMessage = (message, user) => {
    let today = new Date();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    const msgDiv = document.querySelector(".messages");
    const msgsWrapperDiv = document.createElement("div");
    const newMsgDiv = document.createElement("div");
    //added time with the message
    newMsgDiv.innerText = time + ": " + message;

    msgsWrapperDiv.classList.add("message");
    msgsWrapperDiv.classList.add(user);
    msgsWrapperDiv.appendChild(newMsgDiv);
    msgDiv.appendChild(msgsWrapperDiv);

    msgDiv.scrollTo(0, msgDiv.scrollHeight);
  };

  //Refresh button eventlistener - shows the list of peers/users
  let refreshbutton = document.querySelector(".list-all-peers-button");
  refreshbutton.addEventListener("click", () => {
    const peersEl = document.querySelector(".peers");
    peersEl.firstChild && peersEl.firstChild.remove();
    const ul = document.createElement("ul");

    peer.listAllPeers((peers) => {
      peers
        .filter((peerId) => peerId !== myPeerId)

        .forEach((peerId) => {
          console.log(peerId);
          const li = document.createElement("li");
          const button = document.createElement("button");

          button.innerText = peerId;
          button.classList.add("connect-button");
          button.classList.add(`peerId-${peerId}`);

          button.addEventListener("click", connectToPeerClick);
          li.appendChild(button);
          ul.appendChild(li);
        });
      peersEl.appendChild(ul);
    });
  });
  document.addEventListener("peer-changed", (e) => {
    //Update connect buttons
    console.log(e);
    const peerId = e.detail.peerId;
    console.log("peerId:", peerId);
    const peerAddClass = ".peerId-" + peerId;
    let peerRemoveConn = ".connect-button.connected";
    let connectedClass = document.querySelector(peerAddClass);
    //remove class
    document.querySelectorAll(peerRemoveConn).forEach((connectedPeer) => {
      connectedPeer.classList.remove("connected");
    });
    connectedClass && connectedClass.classList.add("connected");

    //update video subtext
    const video = document.querySelector(".video-container.them");
    video.querySelector(".name").innerText = peerId;
    video.classList.add("connected");
    video.querySelector(".stop").classList.remove("active");
    video.querySelector(".start").classList.add("active");
  });

  let myMessage = document.querySelector(".new-message");
  const sendBtn = document.querySelector(".send-new-message-button");

  //implement send message
  const sendMyMessage = () => {
    let message = myMessage.value;
    //Forbid from sending empty messages
    if (!message || message.trim().length === 0) {
      alert("A message is required.");
    } else {
      // Send your messag
      conn.send(message);
      console.log(conn.peer);
      //print message
      printMessage(message, "me");
      //clear the input field once you send the message
      message = document.querySelector(".new-message").value = " ";
    }
  };

  //Display video of me
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: true,
    })
    .then((stream) => {
      const video = document.querySelector(".video-container.me video");
      video.muted = false;
      video.srcObject = stream;
    });

  //start video handler
  const startVideoCallClick = () => {
    console.log("startVideo");
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    startButton.classList.remove("active");
    stopButton.classList.add("active");

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      }) //promise
      .then((myStream) => {
        mediaConn && mediaConn.answer();
        mediaConn = peer.call(conn.peer, myStream);
        mediaConn.on("stream", mediaConnOnStream);
      });
  };

  document
    .querySelector(".video-container.them .start")
    .addEventListener("click", startVideoCallClick);

  const mediaConnOnStream = (theirStream) => {
    const video = document.querySelector(".video-container.them video");
    video.muted = true;
    video.srcObject = theirStream;
  };

  //Stop video click handler
  const StopVideoCallClick = () => {
    console.log("Stop the video");
    mediaConn && mediaConn.close();
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    stopButton.classList.remove("active");
    startButton.classList.add("active");
  };

  //listener to hang up button
  document
    .querySelector(".video-container.them .stop")
    .addEventListener("click", StopVideoCallClick);

  //sending message once enter is pressed
  myMessage.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      sendMyMessage();
    }
  });
  //listener to send message button
  sendBtn.addEventListener("click", sendMyMessage);
})();
