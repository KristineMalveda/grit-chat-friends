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
let peer = new Peer(myPeerId, {
  host:"glajan.com",
  port: 8443,
  path: "/myapp",
  secure: true,
});

//Handle peer events 
peer.on("open", peerOnOpen);

//feltestning
peer.on("error", peerOnError);

//Refresh button eventlistener - shows the list of peers/users 
let refreshbutton = document.querySelector(".list-all-peers-button");
refreshbutton.addEventListener("click", () =>{
  const peersEl = document.querySelector(".peers");
  const ul = document.createElement("ul");

  peer.listAllPeers((peers) => { 
        peers.filter(
          (peerId) => 
            peerId !== myPeerId) 
           
        .map((peerId) => {
          console.log(peerId);
          const li = document.createElement("li");
          const button = document.createElement("button");

          button.innerText = peerId;
          button.classList.add("connect-button");
          button.classList.add(`peerId-${peerId}`);
          li.appendChild(button);
            ul.appendChild(li);
        });
        peersEl.appendChild(ul);
  });
});



