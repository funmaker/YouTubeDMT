import React from "react";


export default function Controls({ onAdd, onFullScreen }) {
  function onSubmit(ev) {
    ev.preventDefault();
    
    onAdd(ev.target.elements.url.value);
  }
  
  function onChange(ev) {
    const input = ev.target;
    const url = input.value;
    
    if(!url.match(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
      input.setCustomValidity("Invalid Youtube URL");
    } else {
      input.setCustomValidity("");
    }
    
    input.form.checkValidity();
  }
  
  function fullScreen(ev) {
    ev.preventDefault();
    
    const target = document.getElementById("fullscreenTarget");
    if(!target) return;
  
    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.mozRequestFullScreen) { /* Firefox */
      target.mozRequestFullScreen();
    } else if (target.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      target.webkitRequestFullscreen();
    } else if (target.msRequestFullscreen) { /* IE/Edge */
      target.msRequestFullscreen();
    }
  }
  
  return (
    <form onSubmit={onSubmit}>
      <input placeholder="Youtube URL" name="url" onChange={onChange} />
      <button>Add</button>
      <button onClick={fullScreen}><i className="icon-fullscreen" /></button>
    </form>
  );
}
