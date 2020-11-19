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
    setGoogleAuth: function(googleAuth){
        this.authInstance = googleAuth;
        console.log("Calling listener");
        controller.authInstance.currentUser.listen(controller.listenerGoogleUser);
        //if user already signed in, redirect automatically
        if (controller.authInstance.isSignedIn.get()){
            controller.loadGoogleUser();
            controller.redirectTo("/profile/"+Profile.name);
        }
    },
    loadGoogleUser: function(){
        console.log("loadGoogleUser");
        this.currentUser = this.authInstance.currentUser.get();
        if (this.currentUser == ""){
            console.log("failed");

        }
        console.log("success");
        var profile = this.currentUser.getBasicProfile();
        var id_token =this.currentUser.getAuthResponse().id_token;
        Profile.name=emailToUniqueName(profile.getEmail());
        Profile.email=profile.getEmail();
        Profile.ID=id_token;
    },
    disconnectUser: function (){
        console.log("disconnectUser");
        var temp = this.authInstance.currentUser.get();
        if (temp == null){return;}
        temp.disconnect();
        controller.currentUser = "";
        this.redirectTo("/");
    },
    listenerGoogleUser: function(){
        console.log("listening");
        if (this.authInstance.isSignedIn.get()){
            this.loadGoogleUser();
            console.log("Call redirect");
            Profile.createProfile();
            this.redirectTo("/profile/"+Profile.name);
        }
        else{

        }
    },
    redirectTo: function(route){
        //wait for Profile.name to be updated when logging in before redirecting to User's Timeline
        console.log("redirecting to "+route);
        m.route.set(route);
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
        if(this.userIsProfile){
            return m('div', {class:'container'}, [
                m("h1", {class: 'title'}, Profile.name),
                m("img",{class: "profilePicture", "src":Profile.url}),
                //m("button",{class:"button", onclick: function(e) { Profile.loadList()}},"Msgs"),
                m("button", {class:'buttonSkin', id:'disconnectButton', onclick: function() {
                	controller.disconnectUser();
                }},"Déconnexion"),
                m("div", {class: 'tile'}, m('div',{class:'postForm'},m(PostForm))),
                m("div",m(PostView,{profile: Profile}))
            ])
        }else{
            return m('div', {class:'container'}, [
                m("h1", {class: 'title'}, Profile.name),
                m("img",{class: "profilePicture", "src":Profile.url}),
                m("button",{class:"button", onclick: function(e) { Profile.loadList()}},"Msgs"),
                m("div",m(PostView,{profile: Profile}))
            ])
        }

    },
    loadList: function() {
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/"+Profile.name+"/post"+'?access_token=' + encodeURIComponent(Profile.ID)
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
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/postMsg"+'?access_token='+encodeURIComponent(Profile.ID),
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
            url: "_ah/api/myApi/v1/deleteMsg/"+name+'?access_token='+encodeURIComponent(Profile.ID)
        })
        .then(function(result) {
            console.log("delete:",result)
            //deleting from view
            Profile.list.splice(Profile.list.indexOf(result),1)
        })
        .catch(function(e) {
            console.log(e.message)
        })
    },
    likePost: function(name) {
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/likePost/"+name+'?access_token='+encodeURIComponent(Profile.ID)
        })
        .then(function(result) {
            console.log("like:",result);
            //updating like from view
            let i = -1;
            Profile.list.map(function(item){
                if(item.properties.date == result.properties.date){
                     i = Profile.list.indexOf(item);
                }
            });
            Profile.list.splice(i,result);
            PostView.redraw();
        })
        .catch(function(e) {
            console.log(e.message)
        })
    },
    createProfile: function(){
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/profile/create"+'?access_token='+encodeURIComponent(Profile.ID),
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
                this.userIsProfile = true;
            }else{
                this.userIsProfile = false;
            }
        }
        this.getProfile(profileName);

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
        m('div', {class:'field'},[
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
    redraw: function(){
        console.log("redraw");
        m.redraw();
    },
    view: function(vnode) {
        return m('div', [
            m('div',{class:'subtitle'}),
            vnode.attrs.profile.list.map(function(item) {
                if (vnode.attrs.profile.userIsProfile){
                    return m('div', {class:'postContainer'}, [
                        m('div', {class: 'likeDiv'},
                            m('button', {class:'likeButton', onclick: function(e) { Profile.likePost(item.key.name) }},"like"),
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
                            m('button', {class:'likeButton', onclick: function(e) {Profile.likePost(item.key.name) }},"like"),
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
                class: "nextButton",
                onclick: function(e) {
                    vnode.attrs.profile.next()
                },
            }),
        ])
    }
}

var PageProfile = {
    view: function(vnode){
        return m(Profile, {name: vnode.attrs.user})
    }
}

var TimeLine = {
    list: [],
    view: function(){

    }
}


