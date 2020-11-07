<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
	<meta http-equiv="content-type"
	content="application/xhtml+xml; charset=UTF-8" />
	<meta name="google-signin-scope" content="profile email">
	<meta name="google-signin-client_id" content="1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com">
	<script src="https://apis.google.com/js/platform.js" async defer></script>
	<link rel="stylesheet" href="stylesheets/style.css">
	<script type="text/javascript" src="javascript/userManager.js"></script>
	<title>TinyGram</title>
</head>

<body>
	<div id="left" class="vertically-centered">
		<img class="frontImg" src="./frontImg.jpg" alt="TinyInsta front page image"/>
	</div>
	
	<div id="right" class="vertically-centered">
		<h1>TinyGram</h1>
	
		<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
	    <div class="line"></div>
		<div id="btnDiv">
			<button type="button" class="btn">
				<a href='/profile' class=btnLink>Profil</a>
			</button>
		</div>
	</div>
	<div class="signature">
		<p>Louis NORMAND, Raphaël TENAUD  -Web & Cloud-</p>
	</div>
</body>
</html>