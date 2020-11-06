<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
	<meta http-equiv="content-type"
	content="application/xhtml+xml; charset=UTF-8" />
	<meta name="google-signin-scope" content="profile email">
	<meta name="google-signin-client_id" content="1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com">
	<script src="https://apis.google.com/js/platform.js" async defer></script>
	
	<style>
		@font-face {
			font-family: 'Billabong';
			font-style: normal;
			font-weight: normal;
			src: local('Billabong'), url('Billabong.woff') format('woff');
		}
		h1 {
			text-align: center;
			font-family:'Billabong';
			font-weight: normal;
			font-size: 100px;
		}
		#left { 
			float: left;
			width: 45%;
			margin: 0;
			top: 50%;
			position: absolute;
			/*border-width: 1px;
			border-style: solid;
			border-color: black;*/
		}
		#right { 
			float: right; 
			width: 45%;
			left: 50%;
			margin: 0;
			top: 10%;
			position: absolute;
			/*border-width: 1px;
			border-style: solid;
			border-color: black;*/
		}
		#img {
		}
		a {
			font-family:'Billabong';
			font-weight: normal;
			font-size: 20px;
		}
		.g-signin2{
		  width: 100%;
		}

		.g-signin2 > div{
		  margin: 0 auto;
		}
		.btn {
			position: relative;
			float: right;
			text-decoration: none;
			padding-left: 15px;
			padding-right: 15px;
			font-size: 1em;
			color: #a5a5a5;
			background-color: #ffffff;
			border-radius: 10px;
			box-shadow: 0px 0px 10px #d8d8d8;
		}
		.btnLink:link {
			text-decoration: none
		}
		.btn:hover {
			padding-left: 15px;
			padding-right: 15px;
			background-color: #f2f2f2;
		}
		.signature{
			width: 100%;
			position:absolute;
 			bottom:0;
 			text-align: center;
 			font-size: 10px;
		}
		
	</style>
	<title>TinyGram</title>
</head>

<body>
	<div id="left" class="vertically-centered">
		<div id="img">
			<p>IMAGE DE PRESENTATION</p>
		</div>
	</div>
	
	<div id="right" class="vertically-centered">
		<h1>TinyGram</h1>
	
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
		<button type="button" class="btn">
			<a href='/profile' class=btnLink>Profil</a>
		</button>
	</div>
	<div class="signature">
		<p>Louis NORMAND, Raphaël TENAUD  -Web & Cloud-</p>
	</div>
</body>
</html>