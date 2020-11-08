<html lang="en">
<head>
    <meta name="google-signin-scope" content="profile email">
    <meta name="google-signin-client_id"
          content="1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com">
    <script src="https://apis.google.com/js/platform.js" async defer></script>


    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">


    <link rel="stylesheet" href="stylesheets/profile.css">
    <link rel="stylesheet" href="stylesheets/common.css">
    
    <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>


    <script src="https://unpkg.com/mithril/mithril.js"></script>


</head>
<body>
    <script>
        var Profile={
            name:"",
            email:"",
            ID:"",
            url:"",
            nextToken:"",
            list:[],
            view: function(){
            return m('div', {class:'container'}, [
                m("h1", {class: 'title'}, Profile.name),
                m("img",{class: "profilePicture", "src":Profile.url}),
                m("button",{class:"button", onclick: function(e) { Profile.loadList()}},"Msgs"),
                m("div", {class: 'tile'}, m('div',{class:'tile is-child box'},m(PostForm))),
                m("div",m(PostView,{profile: Profile}))
            ])
        },
        loadList: function() {
            return m.request({
                method: "GET",
                url: "_ah/api/myApi/v1/collectionresponse_entity"+'?access_token=' + encodeURIComponent(Profile.ID)
            })
            .then(function(result) {
                console.log("load_list:",result)
                Profile.list=result.items
                if ('nextPageToken' in result) {
                Profile.nextToken= result.nextPageToken
                } else {
                Profile.nextToken=""
                }})
            },
            next: function() {
                return m.request({
                    method: "GET",
                    url: "_ah/api/myApi/v1/collectionresponse_entity",
                    params: {
                        'next':Profile.nextToken,
                        'access_token': encodeURIComponent(Profile.ID)
                    }
                })
                .then(function(result) {
                    console.log("next:",result)
                    result.items.map(function(item){Profile.list.push(item)})
                    if ('nextPageToken' in result) {
                        Profile.nextToken= result.nextPageToken
                    } else {
                        Profile.nextToken=""
                    }
                })
            },
            postMessage: function(desc,url) {
                var data={'url': url,
                    'body': desc}
                console.log("post:"+data)
                if (data.url != ""){
                    return m.request({
                        method: "POST",
                        url: "_ah/api/myApi/v1/postMsg"+'?access_token='+encodeURIComponent(Profile.ID),
                        params: data,
                    })
                    .then(function(result) {
                        console.log("post_message:",result)
                        Profile.loadList()
                    })
                }
            },
            deleteMessage: function(name) {
                return m.request({
                    method: "DELETE",
                    url: "_ah/api/myApi/v1/deleteMsg/"+name+'?access_token='+encodeURIComponent(Profile.ID)
                })
                .then(function(result) {
                    console.log("delete:",result)
                    Profile.list.splice(Profile.list.indexOf(result),1)
                })
                .catch(function(e) {
                    console.log(e.message)
                })
            }
        }
        var PostForm = {
            url:"",
            body:"",
            view: function() {
                return m("form", {
                    onsubmit: function(e) {
                        e.preventDefault()
                        if (url ="") {console.log("No url")}
                        Profile.postMessage(PostForm.body,PostForm.url)
                    }
                },
                [
                m('div', {class:'field'},[
                m("label", {class:'labelURL'},"URL"),
                m('div',{class:'control'}, m("input[type=text]", {
                class:'input urlInput',
                placeholder:"Your url",
                oninput: function(e) {PostForm.url = e.target.value}})),
                //		          m("img",{"src":this.url}),
                ]),
                m('div',{class:'field'},[
                m("label", {class: 'label'},"Body"),
                m('div',{class:'control'},m("input[type=textarea]", {
                class:'textarea',
                placeholder:"Your text",
                oninput: function(e) { PostForm.body = e.target.value }})),
                ]),
                m('div',{class:'control'},m("button[type=submit]", {class:'button is-link'},"Post")),
                ])
            }
        }
        var PostView = {
            view: function(vnode) {
                return m('div', [
                    m('div',{class:'subtitle'}),
                    vnode.attrs.profile.list.map(function(item) {
                        return m('div', {class:'postContainer'}, [
                        	m('div', {class: 'likeDiv'},
                            	m('a.link[href=#]', {class:'likeButton', onclick: function(e) { }},"like"),
                            	m('label', {class: 'likeCounter'}, item.properties.likec + " j'aimes"),
                            ),
                            m('a.link[href=#]', {class:'delButton', onclick: function(e) {
                                e.preventDefault()
                                Profile.deleteMessage(item.key.name)
                            }},
                            	m('img', {src:"img/trashIcon.png", class:'trashImg'}),
                            ),
                            m('div', {class: 'bodyDiv'},
                            	m('label', {class: 'bodyPost'}, item.properties.body),
                            ),
                            m('img', {class: 'imagePost', 'src': item.properties.url}),
                        ])
                    }),
                    m('a.link[href=#]',{class: 'nextButton', onclick: function(e) {vnode.attrs.profile.next()}},
                		m("img", {src:"img/nextArrow.png", class:'nextImg'}),
                	),
            	])
        	}
        }


        function onSignIn(googleUser) {
            var profile = googleUser.getBasicProfile();
            Profile.name=profile.getName();
            Profile.email=profile.getEmail();
            Profile.ID=googleUser.getAuthResponse().id_token;
            Profile.url=profile.getImageUrl();
            m.route.set("/logged")
        }

        var Login = {
            view: function() {
                return m('div', {class:'container'}, [
                m("h1", {class: 'title'}, 'The TinyGram Post'),
                m("div", {
                    "class":"g-signin2",
                    "data-theme":"dark",
                    "data-onsuccess": "onSignIn"}),
                ])
            }
        }

        m.route(document.body, "/logged", {
          "/logged": { onmatch: function() {
                        if (Profile.ID=="") {m.route.set("/login")}
                        else return Profile
                        }},
          "/login": Login
        })

	</script>
		<h1 id="mainTitle">TinyGram</h1>
		<a href="/index.jsp" onclick="signOut()" id="signOutLink">Se déconnecter</a>
	<script>
		function signOut() {
			var auth2 = gapi.auth2.getAuthInstance();
			if(auth2.isSignedIn.get()) {
				auth2.signOut().then(function () {
					//
				});
			}
		}
	</script>
	<div class="line"></div>
</body>
</html>


