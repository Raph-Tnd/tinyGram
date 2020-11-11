function entityToProfile(entity){
    Profile.email = entity.properties.email;
    Profile.name = entity.properties.name;
    Profile.url = entity.properties.url;
    Profile.loaded = true;
}

var Profile={
    name:"",
    email:"",
    ID:"",
    url:"",
    nextToken:"",
    loaded:false,
    list:[],
    view: function(vnode){
        Profile.loadProfile(vnode.attrs.name);
        return m('div', {class:'container'}, [
            m("h1", {class: 'title'}, Profile.name),
            m("h1", {class: 'title'}, Profile.ID),
            m("img",{class: "profilePicture", "src":Profile.url}),
            m("button",{class:"button", onclick: function(e) { Profile.loadList()}},"Msgs"),
            m("div", {class: 'tile'}, m('div',{class:'postForm'},m(PostForm))),
            m("div",m(PostView,{profile: Profile}))
        ])
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
    getMessage: function(){
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/"+Profile.name+"/getMessage"+encodeURIComponent(Profile.ID),
        })
        .then(function(result){

        })
    },
    postMessage: function(desc,url) {
        console.log(Profile.ID);
        var data={'url': url,
            'body': desc}
        return m.request({
            method: "POST",
            url: "_ah/api/myApi/v1/postMsg"+'?access_token='+encodeURIComponent(Profile.ID),
            params: data,
        })
        .then(function(result) {
            console.log("post_message:",result)
            //Profile.loadList()
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
            Profile.list.splice(Profile.list.indexOf(result),1)
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
        if (!Profile.loaded){
            Profile.getProfile(profileName)
        }
    },
    getProfile: function(profileName){
        return m.request({
            method: "GET",
            url: "_ah/api/myApi/v1/profile/get/"+profileName+'?access_token='+encodeURIComponent(Profile.ID),
        })
        .then(function (result){
            entityToProfile(result)
        })
        .catch(function(e){
            console.log("message: ",e.messages,"code: ", e.code)
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
                if (url ="") {return ;}
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
        m('div',{class:'control'},m("button[type=submit]", {class:'postButton'},"Publier")),
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
var Login = {
    view: function() {
        return m('div', {class:'container'}, [
        m("h1", {class: 'title'}, 'The TinyGram Post'),
        m("div", {
            "class":"g-signin2",
            "data-theme":"dark",
            "data-onsuccess": "onSignIn"}),
        m('div', {type:'button', class:'btn',onclick: function (e){
            signOut()
        }})
        ])
    }
}


/*m.route(document.body, "/logged", {
    "/logged":{onmatch: function(){
        if (Profile.ID=="") {
            console.log("Profile not found")
            return Login
        }
        else return Profile
    }},
    "/profile/:user": {onmatch: function (){
        console.log("user searching")
        if (m.route.params("user") == "logged"){
            if (Profile.ID=="") {
                console.log("Profile not found")
                return Login
            }
            else return Profile
        }
        else{
            return m.request({
                method: "GET",
                url: "_ah/api/myApi/v1/profile/get/"+ m.route.params("user"),
            })
            .then(function (result){
                console.log(result)
            })
            .catch(function(e) {
                console.log(e.message)
            })
        }
    }}
})
*/



