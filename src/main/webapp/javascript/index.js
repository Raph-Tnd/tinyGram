function emailToUniqueName(email){
	return email.split("@")[0];
}

function onInit(){
	console.log("onInit");
	controller.setGoogleAuth(gapi.auth2.getAuthInstance());
	if (controller.loginButton){
		gapiRender("sign-in-login");
		controller.loginButton = false;
	}
	if (controller.checkUserIsProfile){
		Profile.loadProfile(controller.profileCheck);
		controller.checkUserIsProfile = false;
	}
}

function onError(){
	console.log("Google auth error");
}

function init(){
	console.log("init");
	gapi.load('auth2',function (){
		console.log("initializating gapi");
		gapi.auth2.init({
			client_id: '1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com'
		})
		.then(onInit,onError)
	});
}

function gapiRender(id){
	if (controller.authInstance ==""){
		controller.loginButton = true;
		return;
	}
	console.log("Rendering");
	gapi.signin2.render(id,{
		scope: 'profile email',
		width: 250,
		height: 50,
		longtitle: true,
		theme: 'dark',
		onsuccess: onInit,
		onfailure: onError
	})
	return true;
}



m.route(document.body, "/",{
	"/": HomePage,
	"/timeline": TimeLine,
	"/profile/:user": PageProfile
})