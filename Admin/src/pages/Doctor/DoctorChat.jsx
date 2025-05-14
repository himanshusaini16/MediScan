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

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const createRoomToken = (doctorId, userId) => {
    return [doctorId, userId].sort().join("_");
  };

  useEffect(() => {
    if (!dToken) return;
    getProfileData();
    getAppointments();
  }, [dToken]);

  useEffect(() => {
    if (!selectedPatientId || !socket) return;

    let intervalId;
    const fetchMessages = async () => {
      try {
        const messages = await getRoomMessages(selectedPatientId);
        setMessages(messages || []);
      } catch {
        toast.error("Failed to load messages");
      }
    };

    // Initial fetch and setup polling
    fetchMessages();
    intervalId = setInterval(fetchMessages, 3000);

    // Socket setup
    socket.emit("join-room", selectedPatientId);

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.off("receiveMessage");
    socket.on("receiveMessage", handleReceiveMessage);

    // WebRTC handlers
    const handleWebrtcOffer = async ({ sdp }) => {
      answeredRef.current = true;
      clearTimeout(callTimeoutRef.current);
      await setupPeer(false);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("webrtc-answer", { sdp: answer, roomId: selectedPatientId });
      setInCall(true);
    };

    const handleWebrtcAnswer = async ({ sdp }) => {
      answeredRef.current = true;
      clearTimeout(callTimeoutRef.current);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const handleIceCandidate = ({ candidate }) => {
      peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleEndCall = () => endCall(false);

    socket.on("webrtc-offer", handleWebrtcOffer);
    socket.on("webrtc-answer", handleWebrtcAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);
    socket.on("webrtc-end-call", handleEndCall);

    // Set patient data
    const [userId] = selectedPatientId.split("_");
    const selectedAppointment = appointments.find((appt) => appt.userId === userId);
    setPatientData(selectedAppointment?.userData);

    return () => {
      clearInterval(intervalId);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("webrtc-offer", handleWebrtcOffer);
      socket.off("webrtc-answer", handleWebrtcAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
      socket.off("webrtc-end-call", handleEndCall);
    };
  }, [selectedPatientId, socket, appointments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    const tempMessage = {
      text: newMessage,
      type: image ? 'image' : 'text',
      imageUrl: image ? URL.createObjectURL(image) : null,
      _id: Date.now(), // Temporary ID
      senderRole: "doctor",
      createdAt: new Date().toISOString()
    };

    try {
      // Optimistic update
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage('');
      setImage(null);

      const payload = {
        text: newMessage,
        type: image ? 'image' : 'text',
        image
      };

      const sentMsg = await sendDoctorMessage(selectedPatientId, payload);
      
      // Replace temporary message with actual response
      setMessages((prev) => [
        ...prev.filter(msg => msg._id !== tempMessage._id),
        { ...sentMsg, senderRole: "doctor" }
      ]);
    } catch (error) {
      toast.error('Failed to send message');
      // Rollback optimistic update
      setMessages((prev) => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

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

  if (!uniqueuser || !profileData) {
    return <p className="text-center mt-10 text-gray-500">Loading chat...</p>;
  }

  return (
    <div className="flex flex-col sm:flex-row w-full p-4 h-screen">
      {/* Mobile Patient Selector */}
      <div className="sm:hidden mb-4">
        <select
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full p-2 border rounded-md"
          value={selectedPatientId}
        >
          <option value="">-- Choose a patient --</option>
          {uniqueuser.slice().reverse().map((item, index) => {
            const reverseRoom = createRoomToken(item.userId,profileData._id);
      const roomToken= reverseRoom.split("_").reverse().join("_");
      console.log("room mobile token",roomToken)
            return (
              <option key={index} value={roomToken}>
                {item.userData?.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Desktop Patient List */}
      <div className="hidden sm:block border-r pr-2 w-full sm:w-1/4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 pl-2">Patients</h2>
        {uniqueuser.slice().reverse().map((item, index) => {
          const reverseRoom = createRoomToken(item.userId,profileData._id);
      const roomToken= reverseRoom.split("_").reverse().join("_");
      console.log("room token",roomToken)
          return (
            <div
              key={index}
              onClick={() => setSelectedPatientId(roomToken)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 ${
                selectedPatientId === roomToken ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <img
                className="w-10 h-10 rounded-full object-cover"
                src={item.userData?.image || "/default-user.png"}
                alt={item.userData?.name}
              />
              <span className="font-medium">{item.userData?.name}</span>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col pl-0 sm:pl-4 h-full">
        {!selectedPatientId ? (
          <p className="text-center mt-10 text-gray-500">Select a patient to start chatting</p>
        ) : (
          <>
            {/* Patient Header */}
            <div className="bg-white border rounded-lg p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={patientData?.image || "/default-user.png"}
                  alt={patientData?.name}
                />
                <div className="ml-3">
                  <h3 className="font-semibold">{patientData?.name}</h3>
                  <p className="text-sm text-gray-500">{patientData?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!inCall ? (
                  <>
                    <button
                      onClick={() => startCall("audio")}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg"
                    >
                      Audio
                    </button>
                    <button
                      onClick={() => startCall("video")}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Video
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => endCall(true)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    End Call
                  </button>
                )}
              </div>
            </div>

            {/* Call Interface */}
            {inCall && (
              <div className="flex gap-4 mb-4">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="flex-1 bg-black rounded-lg"
                />
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="flex-1 bg-black rounded-lg"
                />
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 bg-white border rounded-lg overflow-y-auto p-4 mb-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`mb-4 ${msg.senderRole === "doctor" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.senderRole === "doctor"
                        ? "bg-blue-100 ml-auto"
                        : "bg-gray-100 mr-auto"
                    }`}
                  >
                    {msg.type === "image" ? (
                      <img
                        src={msg.imageUrl}
                        alt="message"
                        className="w-48 h-48 object-cover rounded"
                      />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg"
              />
              <label className="cursor-pointer bg-gray-100 p-2 rounded-lg">
                📎
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorChatPage;