"use client";

import React, { useEffect, useRef } from "react";
//import { Room, Track, Participant, RoomEvent, TrackPublication } from "livekit-client";

interface LiveStreamPlayerProps {
  room: Room | null;
  isConnected: boolean;
}

const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ room, isConnected }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!room || !isConnected || !videoRef.current) return;
    
    const handleParticipantPublished = (
      participant: Participant,
      publication: TrackPublication
    ) => {
      if (publication.kind === Track.Kind.Video) {
        const videoElement = publication.track?.attach();
        if (videoElement && videoRef.current) {
          videoElement.style.width = "100%";
          videoElement.style.height = "100%";
          videoElement.style.objectFit = "cover";
          videoRef.current.appendChild(videoElement);
        }
      }
    };
    
    // Handle published tracks from existing participants
    room.participants.forEach(participant => {
      participant.tracks.forEach(publication => {
        if (publication.track && publication.kind === Track.Kind.Video) {
          handleParticipantPublished(participant, publication);
        }
      });
    });
    
    // Handle newly published tracks
    room.on(RoomEvent.TrackPublished, handleParticipantPublished);
    
    return () => {
      room.off(RoomEvent.TrackPublished, handleParticipantPublished);
      
      // Detach all video elements when component unmounts
      if (videoRef.current) {
        while (videoRef.current.firstChild) {
          videoRef.current.removeChild(videoRef.current.firstChild);
        }
      }
    };
  }, [room, isConnected]);
  
  // Fallback video player/loading state
  if (!isConnected) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="mb-4">
            <svg className="animate-spin h-10 w-10 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>Đang kết nối đến phòng livestream...</p>
        </div>
      </div>
    );
  }
  
  // Demo placeholder - would be replaced by actual LiveKit video
  const useFallbackVideo = !room || room.participants.size === 0;
  
  return (
    <div className="w-full h-full bg-black">
      {useFallbackVideo ? (
        <div className="w-full h-full flex items-center justify-center text-white">
          <video 
            src="/videos/demo-stream.mp4" 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop
          />
          <div className="absolute bottom-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
            LIVE
          </div>
        </div>
      ) : (
        <div ref={videoRef} className="w-full h-full"></div>
      )}
    </div>
  );
};

export default LiveStreamPlayer;