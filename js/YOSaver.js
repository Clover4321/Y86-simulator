(function(view){
	var document = view.document;
	//var text = document.getElementById("text");
	var text_options_form = document.getElementById("text-options");
	var text_filename = document.getElementById("text-filename");
	var session = view.sessionStorage;
	// only get URL when necessary in case Blob.js hasn't defined it yet
	var get_blob = function() {
		return view.Blob;
	};
	text_options_form.addEventListener("submit", function(event) {
	event.preventDefault();
	var BB = get_blob();
	if (!window.output) {
		alert("You have not generated anything!");
		return;
	};
	saveAs(
		  new BB(
			  [window.output]
			, {type: "text/plain;charset=" + document.characterSet}
		)
		, (text_filename.value || text_filename.placeholder) + ".txt"
	);
}, false);
}(self));