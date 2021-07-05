import React, { useState } from 'react';
import './App.css';
//import SignIn from './SignIn';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//from firebase web app configs
const firebaseConfig = {
  apiKey: "AIzaSyAz24US3DSwuI0KeYIk0fvMQU2-FCfnjU4",
  authDomain: "chat-app-a1fc1.firebaseapp.com",
  projectId: "chat-app-a1fc1",
  storageBucket: "chat-app-a1fc1.appspot.com",
  messagingSenderId: "826701806661",
  appId: "1:826701806661:web:a0c29e461c10dd3fb9772c",
  measurementId: "G-Z34Z1C3G7D"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

//sign in button
function SignIn() {
  const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }

  return (
      <button onClick={signInWithGoogle}>Sign in with Google</button>
  )

}

//sign out button
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

//when a user adds a new message in chat, it creates a new document in the firebase collection along with timestamp and user id
function ChatRoom() {
  
  const messagesRef = firestore.collection('messages');        //reference a firestore collection
  const query = messagesRef.orderBy('createdAt').limit(25);    //query documents in a collection

  //listen to any updates to data in real time with a hook
  //returns an array of objects, where each object is the chat message in the database
  //react will "react/render" to any changes in realtime
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  //takes the event of sending a message as its argument
  const sendMessage = async(e) => {
    //stop page from refreshing
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    //create new document in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    //dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return (

    <div>
      <div>
        {/* loop over each message */}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      {/* write value to firestore */}
      <form onSubmit={sendMessage}> 
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit">Send</button>
      </form>
    </div>

  )

}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  //compare userid on the firestore document to the user currently logged in
  //this way we can know if the message was sent or received
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

function App() {

  //check if user is logged in
  //if user is logged in, user = object
  //if user is logged out, user = null
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <SignOut />
      </header>

      <section>
        {/* if user: show ChatRoom, else: show SignIn */}
        {user ? <ChatRoom /> : <SignIn />}          
      </section>
    </div>
  );
}

export default App;
