function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	if(auth2.isSignedIn.get()) {
		auth2.signOut().then(function () {
			var signOutLink = document.getElementById('signOut');
			signOutLink.remove();
		});
	}
}

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	var id_token = googleUser.getAuthResponse().id_token;

	const signOutLink = document.createElement('a');
	signOutLink.innerHTML = 'Sign Out';
	signOutLink.setAttribute('title', 'Sign Out');
	signOutLink.setAttribute('href', '#');
	signOutLink.setAttribute('onclick', 'signOut()');
	signOutLink.setAttribute('id', 'signOut');
	var div = document.getElementById('right');
	div.appendChild(signOutLink);
	console.log("1");
}