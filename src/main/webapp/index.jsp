<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
	<meta http-equiv="content-type"
	content="application/xhtml+xml; charset=UTF-8" />
	<meta name="google-signin-scope" content="profile email">
	<meta name="google-signin-client_id" content="1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com">
	<script src="https://apis.google.com/js/platform.js" async defer></script>
<title>TinyGram</title>
</head>

<body>
	<h1>Debut TinyGram</h1>

	<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
	<script>
      function onSignIn(googleUser) {
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();
        console.log("ID: " + profile.getId()); // Don't send this directly to your server!
        console.log('Full Name: ' + profile.getName());
        console.log('Given Name: ' + profile.getGivenName());
        console.log('Family Name: ' + profile.getFamilyName());
        console.log("Image URL: " + profile.getImageUrl());
        console.log("Email: " + profile.getEmail());

        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
        console.log("ID Token: " + id_token);
      }
    </script>

	<a href="#" onclick="signOut();">Sign out</a>
	<script>
	  function signOut() {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function () {
		  console.log('User signed out.');
		});
	  }
	</script>
	<button type="button">
		<a href='/profile'>Profil</a>
	</button>
</body>
</html>