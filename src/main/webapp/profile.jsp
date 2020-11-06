<html lang="en">
<head>
    <meta name="google-signin-scope" content="profile email">
    <meta name="google-signin-client_id"
          content="1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com">
    <script src="https://apis.google.com/js/platform.js" async defer></script>


    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">


    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css">
    <script defer
            src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>


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
                m("h1", {class: 'title'}, "name:"+Profile.name),
                m("h2", {class: 'subtitle'}, "email:"+Profile.email),
                m("img",{"src":Profile.url}),
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
            delete: function(url) {
                var data={'url': url}
                return m.request({
                    method: "POST",
                    url: "_ah/api/myApi/v1/deleteMsg"+'?access_token='+encodeURIComponent(Profile.ID),
                    params: data,
                })
                .then(function(result) {
                    console.log("delete:",result)
                })
                .catch(function() {
                    console.log('err')
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
                m("label", {class:'label'},"URL"),
                m('div',{class:'control'}, m("input[type=text]", {
                class:'input is-rounded',
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
                    m('div',{class:'subtitle'},"My Posts"),
                    m('table', {class:'table is-striped',"table":"is-striped"},[
                    m('tr', [
                        m('th', {width:"50px"}, "like"),
                        m('th', {width:"50px"}, "del"),
                        m('th', {width:"50px"}, "Bodys"),
                        m('th', {width:"50px"}, "Urls"),
                        m('th', {width:"50px"}, "Like"),
                    ]),
                    vnode.attrs.profile.list.map(function(item) {
                        return m("tr", [
                            m("td", m("button", {onclick: function(e) {
                            console.log("like:"+item.key.id)
                            }},"like")),
                            m("td", m("button", {onclick: function(e) {
                            Profile.delete(item.properties.url)
                            }},"del")),
                            m('td', m('label', item.properties.body)),
                            m('td', m('img', {class: 'is-rounded', 'src': item.properties.url})),
                            m('td', m('label', item.properties.likec)),
                            ])
                        }),
        //			    m("div", isError ? "An error occurred" : "Saved"),
                        m('button',{
                              class: 'button is-link',
                              onclick: function(e) {vnode.attrs.profile.next()}
                              },
                          "Next"),
                       ])
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
</body>
</html>


