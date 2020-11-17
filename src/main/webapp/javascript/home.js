var HomePage = {
    view: function (){
        return [m(Home),m(Header),]
    }
}
var Home = {
    oncreate: function(){
        console.log("Calling render");
        gapiRender("sign-in-login");
    },
    view: function(){
        return m('div',[
            m('div', {id:'left', class:'vertically-centered'},
                m('img', {class:'frontImg', src:'./img/frontImg.jpg', alt:'TinyInsta front page image'}),
            ),
            m('div', {id:'right', class:'vertically-centered'},
                m('h1', "TinyGram"),
                m('div', {id : "sign-in-login"}),
                m('div', {class:'line'}),
                m('div', {class:'btnDiv'},[
                        m(m.route.Link,{href: "/profile/"+emailToUniqueName(Profile.email), class:'btn'},"Profile"),
                ])
            ),
            m('div', {class:'signature'},
                m.trust('<p>' +
                    'Louis NORMAND, Raphaël TENAUD, Sylvain BEAUDOIN, Thibault COLIN  -Web & Cloud-</p>')),

        ])
    }
}

var SearchBar = {
    body:"",
    view:function(){
        return m('form', {onsubmit: function(e){
            controller.redirectTo("/profile/"+SearchBar.body)
        }},
        [
        m('div',{class:'field'},[
        m('div',m("input[type=textarea]", {
            class:'searchBar',
            placeholder:"Rechercher profil...",
            oninput: function(e) { SearchBar.body = e.target.value }})),
        ]),
        m('div',{id:'posBtnSearch'},m("button",{id:'searchButton'},"Search")),
    ])
    }
}


var Header = {
    view: function(){
        return m('div',{id: 'sqrHeader'},[
                  m("button", {class:'disconnectButton', id:'disconnectButtonPosHeader', onclick: function() {
                                  	controller.disconnectUser();
                                  }},"Déconnexion"),
                  m('div',{id:'rightPartHeader'},
                      m(m.route.Link,{href:"/"},m('img',{id:'homeLogoHeader',src:'./img/logo_maison.png'}))),
                    /*m('input',{type:'image',id:'homeLogoHeader',src:'./img/logo_maison.png',
                      onclick: function(e) {
                      vnode.attrs.controller.redirectTo("/")
                      }}),])*/
                  m('div',{id:'posRecherche'},m(SearchBar)),
                  m(m.route.Link,{href:"/"},m('div',{id:'tinygramLogoHeader'},'TinyGram')),])

    }
}



