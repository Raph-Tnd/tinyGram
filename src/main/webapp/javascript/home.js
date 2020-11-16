var HomePage = {
    view: function (vnode){
        return m(Home)
    }
}
var Home = {
    oncreate: function(){
        console.log("Calling render");
        gapiRender("sign-in-login");
    },
    view: function(){
        return m('div',[
            m('div', {id:'left'},
                m('img', {class:'frontImg', src:'./frontImg.jpg', alt:'TinyInsta front page image'}),
            ),
            m('div', {id:'right'},
                m('h1', "TinyGram"),
                m('div', {id : "sign-in-login"}),
                m('div', {class:'line'}),
                m('div', {class:'btnDiv'},[
                        //m(m.route.Link,{href: "/profile/"+emailToUniqueName(controller.currentUser.getBasicProfile().getEmail()), class:'btn'},"Profile"),
                        m(m.route.Link,{href: "/profile/tenaudraphael", class:'btn'},"Profile"),
                ])
            ),
            m('div', {class:'signature'},
                m.trust('<p>' +
                    'Louis NORMAND, Raphaël TENAUD, Sylvain BEAUDOIN, Thibault COLIN  -Web & Cloud-</p>'))
        ])
    }
}



