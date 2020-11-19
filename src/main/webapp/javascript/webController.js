function entityToProfile(entity){
    Profile.email = entity.properties.email;
    Profile.name = entity.properties.name;
    Profile.url = entity.properties.url;
}

var controller = {
    authInstance : "",
    currentUser: "",
    callLoginButton:false,
    callCheckUserIsProfile:false,
    profileCheck: "",
    userID: "",
    callFollow:false,
    setGoogleAuth: function(googleAuth){
        controller.authInstance = googleAuth;
        console.log("Calling listener");
        controller.authInstance.currentUser.listen(controller.listenerGoogleUser);
        //if user already signed in, redirect automatically
        if (controller.authInstance.isSignedIn.get()){
            controller.loadGoogleUser();
            //controller.redirectTo("/profile/"+Profile.name);
        }


    },
    loadGoogleUser: function(){
        console.log("loadGoogleUser");
        controller.currentUser = controller.authInstance.currentUser.get();
        if (controller.currentUser == ""){
            console.log("failed");
            return;
        }
        console.log("success");

        var id_token = controller.currentUser.getAuthResponse().id_token;
        /*var profile = controller.currentUser.getBasicProfile();
        if(Profile.name == ""){
            Profile.name=emailToUniqueName(profile.getEmail());
            Profile.email=profile.getEmail();
        }

         */
        controller.userID=id_token;
    },
    listenerGoogleUser: function(){
        console.log("listening");
        if (controller.authInstance.isSignedIn.get()){
            controller.loadGoogleUser();
            console.log("Call redirect");
            Profile.createProfile();
            //controller.redirectTo("/profile/"+Profile.name);
        }
        else{
            console.log(this);
        }
    },
    disconnectUser: function (){
        console.log("disconnectUser");
        var temp = controller.authInstance.currentUser.get();
        if (temp == null){return;}
        temp.disconnect();
        controller.currentUser = "";
        controller.redirectTo("/");
    },
    redirectTo: function(route){
        //wait for Profile.name to be updated when logging in before redirecting to User's Timeline
        console.log("redirecting to "+route);
        m.route.set(route);
    },
    searchProfile: function(profileName){
        console.log("Searching for "+profileName);
        Profile.loadProfile(profileName);
        controller.redirectTo("/profile/"+profileName);
    }
}

var Profile = {
    name:"",
    email:"",
    ID:"",
    url:"",
    nextToken:"",
    userIsProfile:false,
    list:[],
    view: function(vnode){
        if(Profile.name ==""){
            Profile.loadProfile(vnode.attrs.name);
        }
        if(Profile.userIsProfile){
            return m('div', {class:'profileContainer'}, [
                m("h1", {class: 'profileName'}, Profile.name),
                m("img",{class: "profilePicture", "src":Profile.url}),
                //m("button",{class:"button", onclick: function(e) { Profile.loadList()}},"Msgs"),
                m("button", {class:'buttonSkin', id:'disconnectButton', onclick: function(e) {
                	controller.disconnectUser();
                }},"Déconnexion"),
                m("div", {class: 'tile'}, m('div',{class:'postForm'},m(PostForm))),
                m("div",m(PostView,{profile: Profile}))
            ])
        }else{
            return m('div', {class:'profileContainer'}, [
                m("h1", {class: 'profileName'}, Profile.name),
                m("img",{class: "profilePicture", "src":Profile.url}),
                m("button",{class:"buttonSkin", id: 'profileFollow', onclick: function(e) { Profile.follow()}},"Follow"),
                m("div",m(PostView,{profile: Profile}))
            ])
        }

    },
    loadList: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/"+Profile.name+"/post"+'?access_token=' + encodeURIComponent(controller.userID)
        })
        .then(function(result) {
            console.log("load_list:",result)
            Profile.list=result.items
            if ('nextPageToken' in result) {
                Profile.nextToken= result.nextPageToken
            } else {
                Profile.nextToken=""
        }})
        .catch(function(e){
            console.log(e)
        })
    },
    next: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/"+Profile.name+"/post",
            params: {
                'next':Profile.nextToken,
                'access_token': encodeURIComponent(controller.userID)
            }
        })
        .then(function(result) {
            console.log("next:",result)
            if (result.items != null){
                result.items.map(function(item){Profile.list.push(item)})
            }else{
                console.log("No post to show");
            }

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
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/postMsg"+'?access_token='+encodeURIComponent(controller.userID),
            params: data,
        })
        .then(function(result) {
            console.log("post_message:",result)
            Profile.loadList();
        })
        .catch(function(e){
            console.log(e)
        })
    },
    deleteMessage: function(name) {
        return m.request({
            method: "DELETE",
            url: "_ah/api/myApi/v1/deleteMsg/"+name+'?access_token='+encodeURIComponent(controller.userID)
        })
        .then(function(result) {
            console.log("delete:",result)
            Profile.list.splice(Profile.list.indexOf(result),1)
        })
        .catch(function(e) {
            console.log(e.message)
        })
    },
    createProfile: function(){
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/profile/create"+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log(result)
        })
        .catch(function(e) {
            console.log(e.message , e.code)

        })
    },
    loadProfile: function(profileName){
        console.log(controller.authInstance);
        if(controller.authInstance == ""){
            controller.callCheckUserIsProfile = true;
            controller.profileCheck = profileName;
            return;
        }
        if(controller.authInstance.isSignedIn.get()){
            if(profileName == emailToUniqueName(controller.currentUser.getBasicProfile().getEmail())){
                Profile.userIsProfile = true;
            }else{
                Profile.userIsProfile = false;
            }
        }
        Profile.getProfile(profileName);

    },
    getProfile: function(profileName){
        console.log("Call getProfile");
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/get/"+profileName,
        })
        .then(function (result){
            entityToProfile(result)
        })
        .catch(function(e){
            console.log("message: ",e.messages,"code: ", e.code)
        })
    },
    follow: function(){
        console.log("Call follow");
        if(controller.authInstance == ""){
            callFollow = true;
            return;
        }
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/profile/"+Profile.name+"/follow"+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log("Followed"+result.properties.name);
        })
        .catch(function(e){
            console.log(e.messages);
        })
    },



}

var FriendsListView = {
	
}

var PostForm = {
    url:"",
    body:"",
    view: function() {
        return m("form", {
            onsubmit: function(e) {
                if (this.url =="") {return ;}
                Profile.postMessage(PostForm.body,PostForm.url)
            }
        },
        [
        m('div', {class:'formContainer'},[
        m("label", {class:'label'},"URL de l'image"),
        m('div',{class:'control'}, m("input[type=text]", {
        class:'input',
        placeholder:"URL",
        oninput: function(e) {PostForm.url = e.target.value}})),
        //		          m("img",{"src":this.url}),
        ]),
        m('div',{class:'field'},[
        m("label", {class: 'label'},"Description"),
        m('div',{class:'control'},m("input[type=textarea]", {
        class:'input',
        placeholder:"Description",
        oninput: function(e) { PostForm.body = e.target.value }})),
        ]),
        m('div',{class:'control'},m("button[type=submit]", {class:'buttonSkin', id:'postButton'},"Publier")),
        ])
    }
}
var PostView = {
    view: function(vnode) {
        return m('div', [
            m('div',{class:'subtitle'}),
            vnode.attrs.profile.list.map(function(item) {
                if (vnode.attrs.profile.userIsProfile){
                    return m('div', {class:'postContainer'}, [
                        m('div', {class: 'likeDiv'},
                            m('a.link[href=#]', {class:'likeButton', onclick: function(e) { }},"like"),
                            m('label', {class: 'likeCounter'}, item.properties.likec + " j'aimes"),
                        ),
                        m('button', {class:'delButton', onclick: function(e) {
                                    Profile.deleteMessage(item.key.name)
                                }},
                            m('img', {src:"img/trashIcon.png", class:'trashImg'}),
                        ),
                        m('div', {class: 'bodyDiv'},
                            m('label', {class: 'bodyPost'}, item.properties.body),
                        ),
                        m('img', {class: 'imagePost', 'src': item.properties.url}),
                    ])
                }else{
                    return m('div', {class:'postContainer'}, [
                        m('div', {class: 'likeDiv'},
                            m('a.link[href=#]', {class:'likeButton', onclick: function(e) { }},"like"),
                            m('label', {class: 'likeCounter'}, item.properties.likec + " j'aimes"),
                        ),
                        m('div', {class: 'bodyDiv'},
                            m('label', {class: 'bodyPost'}, item.properties.body),
                        ),
                        m('img', {class: 'imagePost', 'src': item.properties.url}),
                    ])
                }
            }),
            m("input", {
                type: "image",
                src: "/img/nextArrow.png",
                class: "postNextButton",
                onclick: function(e) {
                    vnode.attrs.profile.next()
                },
            }),
        ])
    }
}

var SearchBar = {
    body:"",
    view:function(){
        return m('form', {class:'searchBarContainer', onsubmit: function(e){
            controller.searchProfile(SearchBar.body);
        }},
        [
        m('div',{class:'searchBarForm'},[
        m("input[type=textarea]", {class:'textInputSkin', id: 'searchBarTextInput',
            placeholder:"Recherche un profile",
            oninput: function(e) { SearchBar.body = e.target.value }}),
        ]),
        m("button[type=submit]", {class:'buttonSkin', id:'searchBarPostButton'},"Go !"),
    ])
    }
}
var PageProfile = {
    view: function(vnode){
        return [m(Header),m(Profile, {name: vnode.attrs.user})]
    }
}

var FriendsList = {
	view: function() {
		return m(FriendsListView)
	}
}

var TimeLine = {
    nextToken:"",
    list: [],
    view: function(){
        return m('div', [
            m('div',{class:'subtitle'}),
            TimeLine.list.map(function(item) {
                return m('div', {class:'postContainer'}, [
                    m('div', {class: 'likeDiv'},
                        m('a.link[href=#]', {class:'likeButton', onclick: function(e) { }},"like"),
                        m('label', {class: 'likeCounter'}, item.properties.likec + " j'aimes"),
                    ),
                    m('div', {class: 'bodyDiv'},
                        m('label', {class: 'bodyPost'}, item.properties.body),
                    ),
                    m('img', {class: 'imagePost', 'src': item.properties.url}),
                ])
            }),
            m("input", {
                type: "image",
                src: "/img/nextArrow.png",
                class: "nextButton",
                onclick: function(e) {
                    TimeLine.getTimeline()
                },
            }),
        ])
    },
    loadTimeline: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/timeline/"+'?access_token=' + encodeURIComponent(controller.userID)
        })
            .then(function(result) {
                console.log("load_list:",result)
                TimeLine.list=result.items
                if ('nextPageToken' in result) {
                    TimeLine.nextToken= result.nextPageToken
                } else {
                    TimeLine.nextToken=""
                }})
            .catch(function(e){
                console.log(e)
            })
    },
    getTimeline: function(){
        console.log("Call getTimeline");
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/timeline",
            params: {
                'next':TimeLine.nextToken,
                'access_token': encodeURIComponent(controller.userID)
            }
        })
        .then(function(result){
            console.log("next:",result)
            if (result.items != null){
                result.items.map(function(item){TimeLine.list.push(item)})
            }else{
                console.log("No post to show");
            }

            if ('nextPageToken' in result) {
                TimeLine.nextToken= result.nextPageToken
            } else {
                TimeLine.nextToken=""
            }
        })
    }
}




