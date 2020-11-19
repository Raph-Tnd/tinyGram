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
            m('div', {id:'leftContainer'},
                m('img', {class:'leftFrontImg', src:'./img/frontImg.jpg', alt:'TinyInsta front page image'}),
            ),
            m('div', {id:'rightContainer'},
                m('h1', {class:'rightTitle'}, "TinyGram"),
                m('div', {id : "sign-in-login"}),
                //m(m.route.Link,{href: "/profile/"+emailToUniqueName(controller.currentUser.getBasicProfile().getEmail()), class:'btn'},"Profile"),
                
                m(m.route.Link,{href: "/profile/tenaudraphael", class: 'buttonSkin', id:'rightButton'},"Profile"),
                
            ),
            m('div', {class:'signatureContainer'},
                m.trust('<p>' +
                    'Louis NORMAND, Raphaël TENAUD, Sylvain BEAUDOIN, Thibault COLIN  -Web & Cloud-</p>')),

        ])
    }
}

var SearchBar = {
    body:"",
    view:function(){
        return m('form', {class: 'searchBarForm', onsubmit: function(e){
            controller.redirectTo("/profile/"+SearchBar.body)
        }},
        [
        m('div', m("input[type=textarea]", {
        	id: 'searchBarTextInput',
            class:'textInputSkin',
            placeholder:"Rechercher profil...",
            oninput: function(e) { SearchBar.body = e.target.value }})),
        m("button",{class:'buttonSkin', id:'searchBarButton'},"Search"),
    ])
    }
}


var Header = {
    view: function(){
        return m('div',{id: 'headerContainer'},[
                  m("button", {class:'buttonSkin', id:'headerDisconnectButton', onclick: function() {
                                  	controller.disconnectUser();
                                  }},"Déconnexion"),
                      m(m.route.Link,{href:"/"},m('img',{id:'headerHomeButton',src:'./img/logo_maison.png'})),
                    
                  m('div',{id:'headerInputContainer'},m(SearchBar)),
                  m(m.route.Link,{href:"/"},m('div',{id:'headerLogo'},'TinyGram')),])

    }
}



