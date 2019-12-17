// this is the "key daemon" that we poll every frame
const keys = [];

window.onkeyup = (e) => {
	keys[e.keyCode] = false;
	e.preventDefault();
};

window.onkeydown = (e)=>{
	keys[e.keyCode] = true;
	
	// checking for other keys - ex. 'p' and 'P' for pausing
	var char = String.fromCharCode(e.keyCode);
	if (char == "p" || char == "P"){
		// do something
	}
};