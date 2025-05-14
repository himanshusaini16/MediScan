// File: DoctorChatPage.jsx

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
    socket.emit("join-room", selectedPatientId);

    const fetchMessages = async () => {
      try {
        const messages = await getRoomMessages(selectedPatientId);
        setMessages(messages || []);
      } catch {
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();

    socket.off("receiveMessage");
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

  const setupPeer = async (isInitiator) => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      localVideoRef.current.srcObject = localStreamRef.current;
    } catch {
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
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-semibold p-4">Patients</h2>
        {uniqueuser.map((appt) => (
          <div
            key={appt.userId}
            className={`p-4 cursor-pointer hover:bg-gray-200 ${selectedPatientId === createRoomToken(profileData._id, appt.userId) ? "bg-blue-100" : ""}`}
            onClick={() => setSelectedPatientId(createRoomToken(profileData._id, appt.userId))}
          >
            {appt.userData?.name || "Unnamed"}
          </div>
        ))}
      </div>

      <div className="w-3/4 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              {msg.type === 'image' ? (
                <img src={msg.image} alt="img" className="w-40 h-auto rounded" />
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex p-4 gap-2 border-t">
          <input
            type="text"
            className="flex-1 border rounded px-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
        </form>

        <div className="flex justify-center gap-4 p-4 border-t">
          <button onClick={() => startCall("audio")} className="bg-green-500 text-white px-4 py-2 rounded">Audio Call</button>
          <button onClick={() => startCall("video")} className="bg-purple-500 text-white px-4 py-2 rounded">Video Call</button>
          {inCall && <button onClick={endCall} className="bg-red-500 text-white px-4 py-2 rounded">End Call</button>}
        </div>

        {inCall && (
          <div className="flex justify-center gap-4 p-4">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-1/2 border rounded" />
            <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 border rounded" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChatPage;
