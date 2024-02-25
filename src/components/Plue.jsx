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
