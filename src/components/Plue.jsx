// import React, { useState, useEffect } from 'react';

// const AudioPlayer = () => {
//   const [playlist, setPlaylist] = useState([]);
//   const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

//   useEffect(() => {
//     // Code to load last playing audio file and continue playing from the last position
//     // This could involve using localStorage or a backend service to store the last played track
//   }, []);

//   const handleFileChange = (event) => {
//     const file = URL.createObjectURL(event.target.files[0]);
//     setPlaylist([...playlist, file]);
//   };

//   const playNextTrack = () => {
//     if (currentTrackIndex < playlist.length - 1) {
//       setCurrentTrackIndex(currentTrackIndex + 1);
//     }
//   };

//   return (
//     <div>
//       <input type="file" accept="audio/*" onChange={handleFileChange} />
//       <audio controls autoPlay onEnded={playNextTrack}>
//         <source src={playlist[currentTrackIndex]} type="audio/mpeg" />
//         Your browser does not support the audio element.
//       </audio>

//       <ul>
//         {playlist.map((track, index) => (
//           <li key={index}>{track.name}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default AudioPlayer;

// import React, { useEffect, useState } from "react";

// function App() {
//   const [audioFiles, setAudioFiles] = useState([]);
//   const [currentFile, setCurrentFile] = useState(null);
//   const [audioElement, setAudioElement] = useState(null);

//   useEffect(() => {
//     const openRequest = indexedDB.open("audioDB", 1);

//     openRequest.onupgradeneeded = function (e) {
//       const db = e.target.result;
//       db.createObjectStore("audioFiles", { keyPath: "id" });
//     };

//     openRequest.onsuccess = function (e) {
//       const db = e.target.result;
//       const transaction = db.transaction("audioFiles", "readonly");
//       const store = transaction.objectStore("audioFiles");
//       const getRequest = store.getAll();

//       getRequest.onsuccess = function (e) {
//         setAudioFiles(e.target.result);
//         const lastPlayedId = localStorage.getItem("lastPlayedId");
//         const lastPlayedTime = localStorage.getItem("lastPlayedTime");
//         if (lastPlayedId) {
//           const lastPlayedFile = e.target.result.find(
//             (file) => file.id === lastPlayedId
//           );
//           setCurrentFile(lastPlayedFile);
//           audioElement.src = URL.createObjectURL(lastPlayedFile.blob);
//           audioElement.currentTime = lastPlayedTime || 0;
//           // Don't call audioElement.play() here
//         }
//       };
//     };
//   }, []);

//   const handlePlay = (file) => {
//     setCurrentFile(file);
//     audioElement.src = URL.createObjectURL(file.blob);
//     audioElement.play();
//   };

//   const handleEnded = () => {
//     const currentIndex = audioFiles.findIndex(
//       (file) => file.id === currentFile.id
//     );
//     const nextIndex = (currentIndex + 1) % audioFiles.length;
//     handlePlay(audioFiles[nextIndex]);
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     const blob = new Blob([file], { type: file.type });
//     const id = Date.now().toString();
//     const openRequest = indexedDB.open("audioDB", 1);

//     openRequest.onsuccess = function (e) {
//       const db = e.target.result;
//       const transaction = db.transaction("audioFiles", "readwrite");
//       const store = transaction.objectStore("audioFiles");
//       store.add({ id, blob });
//       setAudioFiles((prevFiles) => [...prevFiles, { id, blob }]);
//     };
//   };

//   // Add a new state variable to track whether the user has interacted with the page
//   const [hasUserInteracted, setHasUserInteracted] = useState(false);

//   // Add a new effect that calls audioElement.play() when hasUserInteracted becomes true
//   useEffect(() => {
//     if (hasUserInteracted && audioElement) {
//       audioElement.play();
//     }
//   }, [hasUserInteracted, audioElement]);

//   // Modify your render method to set hasUserInteracted to true when the user clicks a button
//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <button onClick={() => setHasUserInteracted(true)}>Play</button>
//       <audio controls />
//       <ul>
//         {audioFiles.map((file) => (
//           <li key={file.id} onClick={() => handlePlay(file)}>
//             {file.id}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState, useRef } from "react";
import "../App.css";

function App() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioElement = useRef(null);

  useEffect(() => {
    const openRequest = indexedDB.open("audioDB", 1);

    openRequest.onupgradeneeded = function (e) {
      const db = e.target.result;
      db.createObjectStore("audioFiles", { keyPath: "id" });
    };

    openRequest.onsuccess = function (e) {
      const db = e.target.result;
      const transaction = db.transaction("audioFiles", "readonly");
      const store = transaction.objectStore("audioFiles");
      const getRequest = store.getAll();

      getRequest.onsuccess = function (e) {
        setAudioFiles(e.target.result);
        const lastPlayedId = localStorage.getItem("lastPlayedId");
        const lastPlayedTime = localStorage.getItem("lastPlayedTime");
        if (lastPlayedId) {
          const lastPlayedFile = e.target.result.find(
            (file) => file.id === lastPlayedId
          );
          setCurrentFile(lastPlayedFile);
          if (audioElement.current) {
            audioElement.current.src = URL.createObjectURL(lastPlayedFile.blob);
            audioElement.current.currentTime = lastPlayedTime || 0;
          }
        }
      };
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const openRequest = indexedDB.open("audioDB", 1);

    openRequest.onsuccess = function (e) {
      const db = e.target.result;
      const transaction = db.transaction("audioFiles", "readwrite");
      const store = transaction.objectStore("audioFiles");
      files.forEach((file) => {
        const blob = new Blob([file], { type: file.type });
        const id = Date.now().toString();
        const name = file.name;
        store.add({ id, blob, name });
        setAudioFiles((prevFiles) => [...prevFiles, { id, blob, name }]);
      });
    };
  };

  const handlePlay = (file) => {
    setCurrentFile(file);
    if (audioElement.current) {
      audioElement.current.src = URL.createObjectURL(file.blob);
      audioElement.current.play();
    }
  };

  const handleEnded = () => {
    const currentIndex = audioFiles.findIndex(
      (file) => file.id === currentFile.id
    );
    const nextIndex = (currentIndex + 1) % audioFiles.length;
    handlePlay(audioFiles[nextIndex]);
  };

  useEffect(() => {
    if (currentFile) {
      localStorage.setItem("lastPlayedId", currentFile.id);
    }
  }, [currentFile]);

  useEffect(() => {
    if (audioElement.current) {
      audioElement.current.ontimeupdate = () => {
        localStorage.setItem(
          "lastPlayedTime",
          audioElement.current.currentTime
        );
      };
      audioElement.current.onended = handleEnded;
    }
  }, [audioElement, audioFiles, currentFile]);

  useEffect(() => {
    if (hasUserInteracted && audioElement.current) {
      audioElement.current.play();
    }
  }, [hasUserInteracted]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        height: "100vh",
        width: "100vw",
      }}
      className="body"
    >
      <div>
        <audio
          className="audio-control music-cursor"
          ref={audioElement}
          controls
        />
      </div>

      <div>
        <input
          type="file"
          accept="audio/mp3"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
          multiple
        />
        <label htmlFor="fileInput" className="label music-cursor">
          Add Song
        </label>
      </div>
      {/* <input type="file" onChange={handleFileChange} multiple /> */}
      {/* <button onClick={() => setHasUserInteracted(true)}>Play</button> */}
      <p className="play-list">Playlist</p>
      <ul className="music-cursor">
        {audioFiles.map((file, idx) => (
          <li key={file.id} onClick={() => handlePlay(file)}>
            {idx + 1} &nbsp; {file.id}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
