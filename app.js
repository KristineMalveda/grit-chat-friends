- //self invoked anonymous function

//Global variable 
(function () { //wrap application in a function

  let peer = null;
  let conn = null;
  const consoleLog = (e) => {
    console.log(e);
  }

  //handle peer events
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };
  const peerOnError = (error) => {
    console.log(error);
  };

  const peerOnConnection = (dataConnection => {
    conn && conn.close();
    conn = dataConnection;
    console.log(conn);

    conn.on("data", (data) => {
      console.log(data);
      printMessage(data, "them");
    });

    //dispatch custom event here. Event name: 'peer-change'
    const event = new CustomEvent('peer-changed', {
      detail: {
        peerId: conn.peer
      }
    });
    document.dispatchEvent(event);
  });

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
      iceServers: [{
          url: ["stun:eu-turn7.xirsys.com"]
        },
        {
          username: "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
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


  //connect to peer
  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent;
    //kollar om conn är satt eller falsy (undefined/null/false)
    if (conn) conn.close();
    conn = peer.connect(peerId);
    console.log(peerId);
    conn.on('open', () => {

      console.log("connection open");
      //create a custom event
      const event = new CustomEvent('peer-changed', {
        detail: {
          peerId: peerId
        }
      });
      document.dispatchEvent(event);

      conn.on("data", (data) => {
        console.log(data);
        //  let them = messagesWrapperDiv.classList.add("them");
        printMessage(data, "them");
      });
    });
    conn.on("error", consoleLog);
  };


  //Implement print message function
  let printMessage = (message, user) => {
    const messagesDiv = document.querySelector(".messages");
    const messagesWrapperDiv = document.createElement("div");
    const newMessageDiv = document.createElement("div");
    newMessageDiv.innerText = message;
    messagesWrapperDiv.classList.add("message");
    messagesWrapperDiv.appendChild(newMessageDiv);
    messagesDiv.appendChild(messagesWrapperDiv);

    if (user === "me") {
    messagesWrapperDiv.classList.add("me"); 
    } else if (user === "them") {
      messagesWrapperDiv.classList.add("them");
    }
  }

  //Refresh button eventlistener - shows the list of peers/users 
  let refreshbutton = document.querySelector(".list-all-peers-button");
  refreshbutton.addEventListener("click", () => {
    const peersEl = document.querySelector(".peers");
    peersEl.firstChild && peersEl.firstChild.remove();
    const ul = document.createElement("ul");

    peer.listAllPeers((peers) => {
      peers.filter(
          (peerId) =>
          peerId !== myPeerId)

        .forEach((peerId) => {
          console.log(peerId);
          const li = document.createElement("li");
          const button = document.createElement("button");

          button.innerText = peerId;
          button.classList.add("connect-button");
          button.classList.add(`peerId-${peerId}`);

          button.addEventListener('click', connectToPeerClick);
          li.appendChild(button);
          ul.appendChild(li);
        });
      peersEl.appendChild(ul);
    });

  });
  document.addEventListener('peer-changed', (e) => {
    //Update connect buttons
    console.log(e);
    const peerId = e.detail.peerId;
    console.log('peerId:', peerId);
    const peerAddClass = ".peerId-" + peerId;
    let peerRemoveConn = ".connect-button.connected";
    //remove class
    document.querySelectorAll(peerRemoveConn).forEach((connectedPeer) => {
      connectedPeer.classList.remove('connected');
    });
    //add connected class  
    document.querySelector(peerAddClass) && document.querySelector(peerAddClass).classList.add('connected');

  })


  //event listener på send button 
  const sendBtn = document.querySelector(".send-new-message-button");
  sendBtn.addEventListener('click', () => {
    //implement send message 
    let message = document.querySelector(".new-message").value;
    console.log(message);
    conn.send(message);
    console.log(conn.peer);
    
    //print message
    printMessage(message, "me");
    message = document.querySelector(".new-message").value = " ";
  });

})();