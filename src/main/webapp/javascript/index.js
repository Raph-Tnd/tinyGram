function emailToUniqueName(email){
	return email.split("@")[0];
}

function onInit(){
	console.log("onInit");
	controller.setGoogleAuth(gapi.auth2.getAuthInstance());

}

function gapiRender(id){
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
}

function renderLogin(){
	gapiRender("sign-in-login");
}

function onError(){
	console.log("Google auth error");
}

function init(){
	console.log("init");
	gapi.load('auth2',function (){
		gapi.auth2.init({
			client_id: '1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com'
		})
		.then(renderLogin,onError)
	});
}

m.route(document.body, "/",{
	"/": {
		view:function(){
			return m(HomePage)
		}
	},
	"/timeline": TimeLine,
	"/profile/:user": PageProfile
})