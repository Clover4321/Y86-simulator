var asmIns;
(function(){
	function init() {
		var dest = document.getElementById("drop_area");
		dest.addEventListener("dragover", function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}, false);

		dest.addEventListener("dragend", function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}, false);

		dest.addEventListener("drop", function(ev) {
			ev.stopPropagation();
			ev.preventDefault();

			var file = ev.dataTransfer.files[0];
			var reader = new FileReader();

			reader.readAsText(file);
			reader.onload = function(f) {
				dest.style.background = "white";
				asmIns = this.result;
				if (asmIns) {
					window.VM.Memory.initialMemory();
					window.VM.Memory.parseInstructor(asmIns);
					dest.innerHTML = "Loaded!";
				};
			}
		}, false);
	}

	document.ondragover = function(e) {
		e.preventDefault();
	};
	document.ondrop = function(e) {
		e.preventDefault();
	}

	window.onload = init;
}());
