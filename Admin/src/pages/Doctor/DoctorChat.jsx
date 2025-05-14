import React, { useContext, useEffect, useRef, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";

const DoctorChatPage = () => {
  const {
    dToken,
    profileData,
    sendDoctorMessage,
    getRoomMessages,
    socket,
    getProfileData,
    appointments,
    getAppointments,
  } = useContext(DoctorContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [image, setImage] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const answeredRef = useRef(false);

  console.log("selectedPatiend Id",selectedPatientId)

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const createRoomToken = (userId, doctorId) => {
    return [userId, doctorId].sort().join("_");
  };

  useEffect(() => {
    if (!dToken) return;
    getProfileData();
    getAppointments();
  }, [dToken]);

  useEffect(() => {
    if (!selectedPatientId || !socket) return;

    const fetchMessages = async () => {
      try {
        const messages = await getRoomMessages(selectedPatientId);
        setMessages(messages || []);
      } catch {
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
    socket.emit("join-room", selectedPatientId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("webrtc-offer", async ({ sdp }) => {
      answeredRef.current = true;
      clearTimeout(callTimeoutRef.current);
      await setupPeer(false);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("webrtc-answer", { sdp: answer, roomId: selectedPatientId });
      setInCall(true);
    });

    socket.on("webrtc-answer", async ({ sdp }) => {
      answeredRef.current = true;
      clearTimeout(callTimeoutRef.current);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("webrtc-ice-candidate", ({ candidate }) => {
      peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("webrtc-end-call", () => {
      endCall(false);
    });

    const [userId] = selectedPatientId.split("_");
    const selectedAppointment = appointments.find((appt) => appt.userId === userId);
    setPatientData(selectedAppointment?.userData);

    return () => {
      socket.off("receiveMessage");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      socket.off("webrtc-end-call");
    };
  }, [selectedPatientId, socket, appointments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    const payload = {
      text: newMessage,
      type: image ? 'image' : 'text',
      image, 
      timestamp: new Date().toISOString(),
    };

    try {
      const sentMsg = await sendDoctorMessage(selectedPatientId, payload);
      if (sentMsg) {
        setMessages((prev) => [...prev, sentMsg]);
        setNewMessage('');
        setImage(null); 
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  console.log("patient id",selectedPatientId)

  const setupPeer = async (isInitiator) => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      localVideoRef.current.srcObject = localStreamRef.current;
    } catch (err) {
      toast.error("Camera/Microphone access denied.");
      return;
    }

    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    peerConnectionRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice-candidate", {
          candidate: event.candidate,
          roomId: selectedPatientId,
        });
      }
    };

    if (isInitiator) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("webrtc-offer", {
        sdp: offer,
        roomId: selectedPatientId,
      });

      answeredRef.current = false;
      callTimeoutRef.current = setTimeout(() => {
        if (!answeredRef.current) {
          sendDoctorMessage(selectedPatientId, {
            text: "Missed Call",
            type: "text",
            timestamp: new Date().toISOString(),
          });
          endCall(false);
          toast.info("No answer. Missed call sent.");
        }
      }, 30000);
    }
  };

  const startCall = async (type) => {
    setCallType(type);
    setInCall(true);
    await setupPeer(true);
  };

  const endCall = (sendEndMessage = true) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setInCall(false);
    clearTimeout(callTimeoutRef.current);

    if (sendEndMessage) {
      sendDoctorMessage(selectedPatientId, {
        text: "Call Ended",
        type: "text",
        timestamp: new Date().toISOString(),
      });
      toast.info("Call ended");
    }

    socket.emit("webrtc-end-call", { roomId: selectedPatientId });
  };

  const uniqueuser = Array.from(
    new Map(appointments.map(item => [item.userId, item])).values()
  );


  if (!uniqueuser || !profileData)
    return <p className="text-center mt-10 text-gray-500">Loading chat...</p>;

  return (
    <div className="flex flex-col sm:flex-row w-full p-4 h-screen">

  <div className="sm:hidden mb-4">
    <label className="block mb-2 text-sm font-medium text-gray-700">Select Patient</label>
    <select
      onChange={(e) => setSelectedPatientId(e.target.value)}
      className="w-full p-2 border rounded-md"
      value={selectedPatientId}
    >
      <option value="">-- Choose a patient --</option>
      {uniqueuser.slice().reverse().map((item, index) => {
        const roomToken = createRoomToken(item.userId, profileData._id);
        return (
          <option key={index} value={roomToken}>
            {item.userData?.name}
          </option>
        );
      })}
    </select>
  </div>

  <div className="hidden sm:block border-r overflow-y-auto pr-2 w-full sm:w-1/4">
    <h2 className="text-xl font-bold mb-4 pl-2">Patients</h2>
    {uniqueuser.slice().reverse().map((item, index) => {
      const roomToken = createRoomToken(item.userId, profileData._id);
      console.log("room token",roomToken)
      console.log("itemid",item.userId)
      console.log("ProfileDataId",profileData._id)
      console.log("item",item)
      return (
        <div
          key={index}
          onClick={() => setSelectedPatientId(roomToken)}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-all ${
            selectedPatientId === roomToken ? "bg-blue-100" : "hover:bg-gray-100"
          }`}
        >
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={item.userData?.image || "/default-user.png"}
            alt={item.userData?.name}
          />
          <div className="flex flex-col justify-center text-left">
            <span className="font-medium text-gray-800">{item.userData?.name}</span>
          </div>
        </div>
      );
    })}
  </div>

     
      <div className="flex flex-col sm:flex-row w-full h-screen p-2 sm:p-4">

  <div className="w-full sm:w-3/4 flex flex-col justify-between sm:pl-4">
    {!selectedPatientId ? (
      <p className="text-center mt-10 text-gray-500 text-sm sm:text-base">Select a patient to start chatting</p>
    ) : (
      <>
        
        <div className="bg-white border rounded-lg shadow-md p-3 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2 gap-2">
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={patientData?.image || "/default-user.png"}
              alt={patientData?.name}
            />
            <div className="ml-3">
              <h3 className="text-base font-semibold">{patientData?.name}</h3>
              <span className="text-sm text-gray-500">{patientData?.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {!inCall ? (
              <>
                <button
                  onClick={() => startCall("audio")}
                  className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm hover:bg-green-600"
                >
                  Audio Call
                </button>
                <button
                  onClick={() => startCall("video")}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm hover:bg-red-600"
                >
                  Video Call
                </button>
              </>
            ) : (
              <button
                onClick={() => endCall(true)}
                className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-sm hover:bg-gray-700"
              >
                End Call
              </button>
            )}
          </div>
        </div>

      
        {inCall && (
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full sm:w-1/2 h-52 sm:h-64 bg-black rounded" />
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full sm:w-1/2 h-52 sm:h-64 bg-black rounded" />
          </div>
        )}

       
        <div className="bg-white border rounded-lg shadow-md overflow-y-auto p-3 flex flex-col gap-3 h-[300px] sm:h-full">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">No messages yet...</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[75%] p-2 rounded-lg shadow-sm text-sm ${
                  msg.senderRole === "doctor" ? "self-end bg-blue-100" : "self-start bg-gray-200"
                }`}
              >
                {msg.type === "image" ? (
                  <img src={msg.imageUrl} alt="Message" className="w-48 h-48 object-cover rounded-lg" />
                ) : (
                  <p>{msg.text}</p>
                )}
                <p className="mt-1 text-[10px] text-gray-500">
                  {new Date(msg.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })},{" "}
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

       
        <form className="flex flex-col sm:flex-row w-full gap-2 mt-3" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />

          <div className="flex items-center bg-blue-500 p-2 rounded-lg cursor-pointer hover:bg-blue-600">
            <label htmlFor="file-input" className="flex items-center text-white text-sm font-semibold cursor-pointer">
              📎
              <span className="ml-1 hidden sm:inline">Choose file</span>
            </label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </>
    )}
  </div>
</div>

    </div>
  );
};

export default DoctorChatPage;
