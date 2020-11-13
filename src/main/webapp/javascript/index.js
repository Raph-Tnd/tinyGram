function emailToUniqueName(email){
	return email.split("@")[0];
}

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	if(auth2.isSignedIn.get()) {
		auth2.signOut().then(function () {
			var signOutLink = document.getElementById('signOut');
			signOutLink.remove();
		});
	}
}

function onInit(){
	controller.authInstance = gapi.auth2.getAuthInstance();
	//controller.authInstance.currentUser.listen();
	controller.loadGoogleUser();
}

function gapiRender(id){
	gapi.signin2.render(id,{
		scope: 'profile email',
		width: 250,
		height: 50,
		longtitle: true,
		theme: 'dark',
		onsuccess: onInit,
		onfailure: onError
	})
}

function onError(){
	console.log("Google auth error");
}

function init(){
	gapi.load('auth2',function (){
		gapi.auth2.init({
			client_id: '1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com'
		})
		.then(onInit,onError)
	});
}

m.route(document.body, "/",{
	"/": {
		view:function(){
			return m(HomePage)
		}
	},
	"/profile/:user": PageProfile
})