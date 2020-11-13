var HomePage = {
    view: function(){
        return m('div',[
            m('div', {id:'left', class:'vertically-centered'},
                m('img', {class:'frontImg', src:'./frontImg.jpg', alt:'TinyInsta front page image'}),
            ),
            m('div', {id:'right', class:'vertically-centered'},
                m('h1', "TinyGram"),
                m('div', {id : "sign-in-login"}),
                m('div', {class:'line'}),
                m('div', {class:'btnDiv'},[
                        m(m.route.Link,{href: "/profile/"+emailToUniqueName(Profile.email), class:'btn'},"Profile"),
                ]),
                m('button',{class:'btnDiv', onclick: function(){
                    controller.disconnectUser();
                    }},"Disconnect")
            ),
            m('div', {class:'signature'},
                m.trust('<p>' +
                    'Louis NORMAND, Raphaël TENAUD, Sylvain BEAUDOIN, Thibault COLIN  -Web & Cloud-</p>'))
        ])
    }
}



