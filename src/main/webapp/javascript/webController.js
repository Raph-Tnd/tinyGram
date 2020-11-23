function entityToProfile(entity){
    Profile.email = entity.properties.email;
    Profile.name = entity.properties.name;
    Profile.accountName = entity.properties.accountName;
    Profile.description = entity.properties.description;
    Profile.url = entity.properties.url;
    Profile.listLike = [];
    Profile.listPost = [];
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
        controller.userID=id_token;
    },
    listenerGoogleUser: function(){
        console.log("listening");
        if (controller.authInstance.isSignedIn.get()){
            controller.loadGoogleUser();
            console.log("Call redirect");
            Profile.createProfile();
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
    accountName:"",
    description:"",
    email:"",
    url:"",
    nextToken:"",
    userIsProfile:false,
    listPost:[],
    listLike:[],
    oncreate: function(){
        Profile.loadList();
    },
    view: function(vnode){
        if(Profile.accountName ==""){
            Profile.loadProfile(vnode.attrs.user_url);
        }
        if(Profile.userIsProfile){
            return m('div', {class:'bodyContainer'}, [
                m("div", {class:'profileContainer'},[
                    m("h1", {class: 'profileName'}, Profile.name),
                    m("p", {class: 'profileDescription'}, Profile.description),
                    m("img",{class: "profilePicture", "src":Profile.url}),
                    m(m.route.Link,{href:"/profile/"+Profile.accountName+"/update"},m('button',{class:'buttonSkin',id:'profileModification'},"Modification du Profil")),
                    m("div", {class: "profilePostSeparator"}),
                ]),
                m(PostForm),
                m("div",m(PostView,{profile: Profile}))
            ])
        }else{
            return m('div', {class:'bodyContainer'}, [
                m("div", {class:'profileContainer'},[
                    m("h1", {class: 'profileName'}, Profile.name),
                    m("p", {class: 'profileDescription'}, Profile.description),
                    m("img",{class: "profilePicture", "src":Profile.url}),
                    m("button",{class:"buttonSkin", id: 'profileFollow', onclick: function(e) { Profile.follow()}},"Follow"),
                    m("div", {class: "profilePostSeparator"}),
                ]),
                m("div",m(PostView,{profile: Profile}))
            ])
        }

    },
    loadList: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/"+Profile.accountName+"/post"+'?access_token=' + encodeURIComponent(controller.userID)
        })
        .then(function(result) {
            console.log("load_list:",result)
            Profile.listPost=result.items;
            Profile.listPost.map(function(item){
                Profile.loadLike(item.key.name);
                PostView.iniListLiked(item.key.name);
            })
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
            url: "_ah/api/myApi/v1/profile/"+Profile.accountName+"/post",
            params: {
                'next':Profile.nextToken,
                'access_token': encodeURIComponent(controller.userID)
            }
        })
        .then(function(result) {
            console.log("next:",result)
            if (result.items != null){
                result.items.map(function(item){
                    Profile.listPost.push(item);
                    Profile.loadLike(item.key.name);
                    PostView.iniListLiked(item.key.name);
                })
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
    loadLike: function(postKey){
        console.log("loadLike")
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/getLike/"+postKey,
        })
        .then(function(result){
            console.log(result);
            Profile.listLike.push(result.properties.likec);
        })
    },
    postMessage: function(desc,url) {
        console.log( "postMessage")
        var data={'url': url,
            'body': desc
        }
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/postMsg"+'?access_token='+encodeURIComponent(controller.userID),
            params: data,
        })
        .then(function(result) {
            console.log("post_message:",result)
            Profile.createLikePost(result.key.name);
        })
        .catch(function(e){
            console.log(e)
        })
    },
    createLikePost: function(key){
        console.log( "Create like post")
        console.log(key)
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/createPostLike/"+key+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log(result);
            Profile.loadList();
        })
    },
    deleteMessage: function(name) {
        return m.request({
            method: "DELETE",
            url: "_ah/api/myApi/v1/deleteMsg/"+name+'?access_token='+encodeURIComponent(controller.userID)
        })
        .then(function(result) {
            console.log("delete:",result)
            Profile.deleteLikePost(result.key.name);
        })
        .catch(function(e) {
            console.log(e.message)
        })
    },
    deleteLikePost: function(key){
        return m.request({
            method: "DELETE",
            url: "_ah/api/myApi/v1/deleteLike/"+key+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log(result);
            //deleting from view
            Profile.listPost.splice(Profile.listPost.indexOf(result),1);
            Profile.listLike.splice(Profile.listPost.indexOf(result),1);
            PostView.listLiked.splice(Profile.listPost.indexOf(result),1);
            TimeLine.listLiked.splice(Profile.listPost.indexOf(result),1);
        })
    },
    likePost: function(key) {
        console.log("likePost")
        console.log(key)
        return m.request({
            method: "PUT",
            url: "_ah/api/myApi/v1/likePost/"+key+'?access_token='+encodeURIComponent(controller.userID)
        })
        .then(function(result) {
            console.log("like:",result);
            //updating like from view
            let i = -1;
            Profile.listPost.map(function(item,index){
                if(item.key.name == result.properties.key){
                     i = index;
                }
            });
            Profile.listLike.splice(i,1,result.properties.likec);
            PostView.isLiked(result.properties.key,i);
            TimeLine.isLiked(result.properties.key,i);
            //PostView.redraw();
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
            url: "_ah/api/myApi/v1/profile/"+Profile.accountName+"/follow"+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log("Followed "+result.properties.name);
        })
        .catch(function(e){
            console.log(e.messages);
        })
    },
    updateProfile: function(name,url, desc){
        console.log("Call update profile");
        var data = { 'name': name,
            'url': url,
            'description' : desc
        }
        console.log(data);
        return m.request({
            method: "PUT",
            url: "_ah/api/myApi/v1/profile/"+Profile.accountName+"/update"+'?access_token='+encodeURIComponent(controller.userID),
            params: data,
        })
        .then(function (result){
            console.log("updated to " + result );
            Profile.loadProfile(Profile.accountName);
        })
        .catch(function (e){
            console.log(e)
        })
    }
}

var PostForm = {
    url:"",
    body:"",
    view: function() {
        return m("form", {
        	class:'formContainer',
            onsubmit: function(e) {
                if (PostForm.url =="") {return ;}
                Profile.postMessage(PostForm.body,PostForm.url)
            }
        },
        [
        m('div',[
        m('div',{class:'control'}, m("input[type=text]", {
        	class: 'textInputSkin',
        	id:'formInput',
        	placeholder:"URL",
        	oninput: function(e) {PostForm.url = e.target.value}})),
        ]),
        m('div',{class:'field'},[
        m('div',{class:'control'},m("input[type=textarea]", {
        	class: 'textInputSkin',
        	id:'formInput',
        	placeholder:"Description",
        	oninput: function(e) { PostForm.body = e.target.value }})),
        ]),
        m('div',{class:'control'},m("button[type=submit]", {class:'buttonSkin', id:'formButton'},"Publier")),
        ])
    }
}

var PostView = {
    listLiked: [],
    iniListLiked: function(temp){
        buttonState = 'img/unliked.png';
        console.log(temp);
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/getLikePerson/"+temp+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log(result);
            temp = result.properties.hasLiked;
            if (temp == "true"){
                buttonState = 'img/liked.png';
            }
            if (temp == "false"){
                buttonState = 'img/unliked.png';
            }
            PostView.listLiked.push(buttonState);
        })
    },
    isLiked: function(temp,index){
        buttonState = 'img/unliked.png';
        console.log(temp);
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/getLikePerson/"+temp+'?access_token='+encodeURIComponent(controller.userID),
        })
        .then(function(result){
            console.log(result)
            if (result.properties.hasLiked == "true"){
                buttonState = 'img/liked.png';
            }else{
                buttonState = 'img/unliked.png';
            }
            PostView.listLiked.splice(index,1,buttonState);
        })

        },
        view: function(vnode) {
            return m('div', [
                vnode.attrs.profile.listPost.map(function(item,index) {
                    if (vnode.attrs.profile.userIsProfile){
                        return m('div', {class:'postContainer'}, [

                            m('button', {class:'postDeleteButton', onclick: function(e) {
                                        Profile.deleteMessage(item.key.name)
                                }},
                                m('img', {class:'postDeleteButtonImage', src:"img/trashIcon.png"}),
                            ),

                            m('label', {class: 'postBodyContainer'}, item.properties.body),

                            m('img', {class: 'postImage', 'src': item.properties.url}),

                            m('div', {class: 'postLikeContainer'},

                                m('button', {class: 'postLikeButton', onclick: function(e) {
                                    Profile.likePost(item.key.name);
                                }},
                                    m('img', {class: 'postLikeButtonImage', src:PostView.listLiked[index]}),
                                ),
                                m('label', {class: 'postLikeCounter'}, vnode.attrs.profile.listLike[index]+ " like"),
                            ),
                        ])
                    }else{
                        return m('div', {class:'postContainer'}, [
                            m('div', {class: 'postBodyContainer'},
                                m('label', {class: 'postBody'}, item.properties.body),
                            ),
                            m('img', {class: 'postImage', 'src': item.properties.url}),
                            m('div', {class: 'postLikeContainer'},
                                m('button', {class: 'postLikeButton', onclick: function(e) {
                                    Profile.likePost(item.key.name);
                                }},
                                        m('img', {class: 'postLikeButtonImage', src:PostView.listLiked[index]})
                                ),
                                m('label', {class: 'postLikeCounter'}, Profile.listLike[index] + " like"),
                            ),
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

var ProfileUpdate = {
    name:"",
    url:"",
    desc:"",
    view: function() {
        return m('div', {class:'modificationContainerTotal'}, [
            m('form',{
                class: 'modificationContainer',
                onsubmit: function (e){
                    if (ProfileUpdate.name == ""){return ;}
                    Profile.updateProfile(ProfileUpdate.name, "null", "null",);
                }
            },
            [
                m('div',[
                    m('div',{class:'control'}, m("input[type=text]", {
                        class: 'textInputSkin',
                        id:'modificationInput',
                        placeholder:"new Name",
                        oninput: function(e) {ProfileUpdate.name = e.target.value}})),
                ]),
                m('div',{class:'control'},m("button[type=submit]", {class:'buttonSkin', id:'modificationButton'},"Change name"))
            ]),
            m('form',{
                class: 'modificationContainer',
                onsubmit: function (e){
                    if (ProfileUpdate.url == ""){return ;}
                    Profile.updateProfile("null",ProfileUpdate.url, "null",);
                }
            },
            [
                m('div',[
                    m('div',{class:'control'}, m("input[type=text]", {
                        class: 'textInputSkin',
                        id:'modificationInput',
                        placeholder:"URL",
                        oninput: function(e) {ProfileUpdate.url = e.target.value}})),
                ]),
                m('div',{class:'control'},m("button[type=submit]", {class:'buttonSkin', id:'modificationButton'},"Change Image"))
            ]),
            m('form',{
                class: 'modificationContainer',
                onsubmit: function (e){
                    Profile.updateProfile("null","null", ProfileUpdate.desc);
                }
            },
            [
                m('div',[
                    m('div',{class:'control'}, m("input[type=text]", {
                        class: 'textInputSkin',
                        id:'modificationInput',
                        placeholder:"description",
                        oninput: function(e) {ProfileUpdate.desc = e.target.value}})),
                ]),
                m('div',{class:'control'},m("button[type=submit]", {class:'buttonSkin', id:'modificationButton'},"Change Description"))
            ])

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
            placeholder:"Rechercher un profil",
            oninput: function(e) { SearchBar.body = e.target.value }}),
        ]),
        m("button[type=submit]", {class:'buttonSkin', id:'searchBarButton'},"Search"),
    ])
    }
}

var TimeLine = {
    nextToken:"",
    listPost: [],
    listLike: [],
    listLiked: [],
    oncreate: function(){
        TimeLine.getTimeline();
    },
    iniListLiked: function(temp){
        buttonState = 'img/unliked.png';
        console.log(temp);
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/getLikePerson/"+temp+'?access_token='+encodeURIComponent(controller.userID),
        })
            .then(function(result){
                console.log(result);
                temp = result.properties.hasLiked;
                if (temp == "true"){
                    buttonState = 'img/liked.png';
                }
                if (temp == "false"){
                    buttonState = 'img/unliked.png';
                }
                TimeLine.listLiked.push(buttonState);
            })
    },
    isLiked: function(temp,index) {
        buttonState = 'img/unliked.png';
        console.log(temp);
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/getLikePerson/" + temp + '?access_token=' + encodeURIComponent(controller.userID),
        })
            .then(function (result) {
                console.log(result)
                if (result.properties.hasLiked == "true") {
                    buttonState = 'img/liked.png';
                } else {
                    buttonState = 'img/unliked.png';
                }
                TimeLine.listLiked.splice(index, 1, buttonState);
            })
    },
    view: function(vnode){
        return m('div', {class:'bodyContainer'},[
            TimeLine.listPost.map(function(item, index) {
                return m('div', {class:'postContainer'}, [
                    m('div', {class: 'postBodyContainer'},
                    		m('label', {class: 'postBody'}, item.properties.body),
                    ),
                    m('img', {class: 'postImage', 'src': item.properties.url}),
                    m('div', {class: 'postLikeContainer'},
                    		m('button', {class:'postLikeButton', onclick: function(e) {
                                Profile.likePost(item.key.name);
                    		}},
                    				m('img', {class: 'postLikeButtonImage', src:TimeLine.listLiked[index]})
                    		),
                    		m('label', {class: 'postLikeCounter'}, TimeLine.listLike[index] + " like"),
                    ),
                ])
            }),
            /*m("input", {
                type: "image",
                src: "/img/nextArrow.png",
                class: "postNextButton",
                onclick: function(e) {
                    TimeLine.getTimeline()
                },
            }),

             */
        ])
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
                result.items.map(function(item){
                    TimeLine.listPost.push(item);
                    TimeLine.loadLike(item.key.name);
                    TimeLine.iniListLiked(item.key.name);
                })
            }else{
                console.log("No post to show");
            }

            if ('nextPageToken' in result) {
                TimeLine.nextToken= result.nextPageToken
            } else {
                TimeLine.nextToken=""
            }
        })
    },
    loadLike: function(postKey){
        console.log("loadLike")
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/getLike/"+postKey,
        })
        .then(function(result){
            console.log(result);
            TimeLine.listLike.push(result.properties.likec)
        })
    },
}


var ProfilePage = {
    view: function(vnode){
        return [m(Header),m(Profile, {user_url: vnode.attrs.user})]
    }
}

var HomePage = {
    view: function (){
        return [m(Header),m(Home)]
    }
}

var TimeLinePage = {
    view: function (){
        return [m(Header),m(TimeLine)]
    }
}

var ProfileUpdatePage = {
    view: function (){
        return [m(Header),m(ProfileUpdate)]
    }
}

