import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Chat = () => {
  const { id: room } = useParams();
  const { socket, sendMessage, getRoomMessages, userData, doctors } = useContext(AppContext);


  console.log("Socket on Chat Page",socket)

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, doctorId] = room.split('_');
  const [doctor, setDoctor] = useState(null);
  const [image, setImage] = useState(null); // Store the image file

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState(null);
  const callTimerRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(false); // State for incoming call


  useEffect(() => {
    const doc = doctors.find((d) => d._id === doctorId);
    setDoctor(doc);
  }, [doctorId, doctors]);

  useEffect(() => {
    
    const fetchMessages = async () => {
      try {
        const msgs = await getRoomMessages(room);
        setMessages(msgs);
      } catch {
        toast.error('Failed to load messages');
      }

      
    };
    fetchMessages();

    // const interval= setInterval(fetchMessages,3000)

    // return () =>{
    //   clearInterval(interval)
    // }
    
  }, [room, getRoomMessages]);

  // {console.log("Socket from chat page",socket)}
  

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-room', room);
    console.log("join room chat page",room)

    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data.message]);
      console.log(messages)
    });

    socket.on('receive-call', ({ offer, type }) => {
      setIncomingCall(true);
      if (window.confirm(`Incoming ${type} call. Accept?`)) acceptCall(offer, type);
      else toast.info('Call declined');
    });

    socket.on('call-answered', (answer) => {
      peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', (candidate) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('receive-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
    };
  }, [socket, room]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    const payload = {
      text: newMessage,
      type: image ? 'image' : 'text',
      image, 
    };

    try {
      const sent = await sendMessage(room, payload, userData?.role || 'user');
      if (sent) setMessages((prev) => [...prev, sent]);
      setNewMessage('');
      setImage(null);
    } catch {
      toast.error('Failed to send message');
    }
  };


  const startCall = (type) => {
    setCallType(type);
    setIsCalling(true);

    const peer = new RTCPeerConnection();
    peerConnectionRef.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { room, candidate: e.candidate });
    };

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        return peer.createOffer();
      })
      .then((offer) => {
        return peer.setLocalDescription(offer).then(() => {
          socket.emit('call-user', { room, offer, type });
        });
      })
      .catch(() => toast.error('Failed to access camera/mic'));

    callTimerRef.current = setTimeout(() => {
      if (!peer.currentRemoteDescription) sendMissedCallMessage();
    }, 30000);
  };

  const sendMissedCallMessage = () => {
    sendMessage(room, { text: 'Missed Call', type: 'text', imageUrl: null }, userData?.role || 'user')
      .then(() => toast.info('Call not answered'))
      .catch(() => toast.error('Failed to notify missed call'));
    endCall();
  };

  const acceptCall = (offer, type) => {
    const peer = new RTCPeerConnection();
    peerConnectionRef.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('ice-candidate', { room, candidate: e.candidate });
    };

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true })
      .then((stream) => {
        setIsCalling(true);
        setCallType(type);
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        return peer.setRemoteDescription(new RTCSessionDescription(offer));
      })
      .then(() => peer.createAnswer())
      .then((answer) => {
        peer.setLocalDescription(answer);
        socket.emit('call-accepted', { room, answer });
      })
      .catch(() => toast.error('Failed to accept call'));

    clearTimeout(callTimerRef.current);
    setIncomingCall(false); // Reset incoming call state after accepting
  };

  const endCall = () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    if (peerConnectionRef.current) peerConnectionRef.current.close();

    setIsCalling(false);
    setLocalStream(null);
    setRemoteStream(null);
    peerConnectionRef.current = null;
    clearTimeout(callTimerRef.current);

    sendMessage(room, { text: 'Call Ended', type: 'text', imageUrl: null }, userData?.role || 'user')
      .then(() => toast.info('Call ended'))
      .catch(() => toast.error('Failed to notify call end'));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
    <ToastContainer />
    
    <div className="bg-blue-600 text-white py-3 px-4 shadow-md flex justify-between items-center flex-wrap sm:flex-nowrap">
      <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
        {doctor && (
          <>
            <img className="w-10 h-10 rounded-full" src={doctor.image} alt={doctor.name} />
            <h2 className="ml-3 text-lg sm:text-xl font-semibold truncate">{doctor.name}</h2>
          </>
        )}
      </div>
  
      <div className="flex gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
        {!isCalling ? (
          <>
            <button
              onClick={() => startCall('audio')}
              className="bg-green-500 text-sm px-3 py-2 rounded-full hover:bg-green-600"
            >
              Audio Call
            </button>
            <button
              onClick={() => startCall('video')}
              className="bg-red-500 text-sm px-3 py-2 rounded-full hover:bg-red-600"
            >
              Video Call
            </button>
          </>
        ) : (
          <button
            onClick={endCall}
            className="bg-gray-500 text-sm px-3 py-2 rounded-full hover:bg-gray-600"
          >
            End Call
          </button>
        )}
      </div>
    </div>

    {incomingCall && !isCalling && (
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 p-3 rounded-lg z-50">
        <button
          onClick={() => acceptCall(incomingCall.offer, incomingCall.type)}
          className="text-white bg-blue-600 px-4 py-2 text-sm rounded-full"
        >
          Pickup Call
        </button>
      </div>
    )}
  
   
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet...</p>
      ) : (
        messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.senderRole === userData?.role ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-lg shadow text-black text-sm ${
              msg.senderRole === userData?.role ? 'bg-blue-100' : 'bg-gray-200'
            }`}>
              {msg.type === 'image' ? (
                <img src={msg.imageUrl} alt="Message" className="w-50 h-40 rounded" />
              ) : (
                <p>{msg.text}</p>
              )}
              <p className="mt-1 text-[10px] text-gray-500 text-right">
                {new Date(msg.createdAt).toLocaleDateString()} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  
    {isCalling && callType === 'video' && (
      <div className="flex flex-col sm:flex-row justify-center items-center bg-black space-y-4 sm:space-y-0 sm:space-x-6 p-4">
        <video ref={localVideoRef} className="w-full sm:w-1/2 max-w-md rounded" muted autoPlay />
        <video ref={remoteVideoRef} className="w-full sm:w-1/2 max-w-md rounded" autoPlay />
      </div>
    )}
  
    <div className="bg-white p-3 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md">
      <form className="flex w-full gap-2" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
  
        <label htmlFor="file-input" className="flex items-center text-white bg-blue-500 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-600">
          <i className="fas fa-upload mr-1"></i> Choose
          <input
            id="file-input"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
        </label>
  
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  </div>
  
  );
};

export default Chat;
