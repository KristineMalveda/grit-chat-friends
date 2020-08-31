- //self invoked anonymous function
(function () { //wrap application in a function

  //Global variable
  let peer = null;
  let conn = null;
  const consoleLog = (e) =>{
    console.log(e);
  }

  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };
  const peerOnError = (error) => {
    console.log(error);
  }

  //*Location object : random id if the hash location is not defined 
  const myPeerId = location.hash.slice(1);
  console.log(myPeerId);

  //Create a peer object to connect peer server 
  peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
  });

  //Handle peer events 
  peer.on("open", peerOnOpen);

  //feltestning
  peer.on("error", peerOnError);

  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent;   
    conn && conn.close();
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
    });


    conn.on("error", consoleLog);
  };
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
  document.addEventListener('peer-changed',(e)=> {
      console.log(e);
      const peerId = e.detail.peerId;
      console.log('peerId:', peerId);
      const peerAddClass = ".peerId-" + peerId; 
      let peerRemoveConn = ".connect-button.connected";
      //remove class
    document.querySelectorAll(peerRemoveConn).forEach ((connectedPeer) =>{
      connectedPeer.classList.remove('connected');
    }); 
      //add connected class  
      document.querySelector(peerAddClass).classList.add('connected');  
  })
 
})();