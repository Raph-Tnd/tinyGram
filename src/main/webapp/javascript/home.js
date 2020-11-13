var HomePage = {
    oncreate : function(){
        gapiRender("sign-in-login");
    },
    view: function(){
        return m('div',[
            m('div', {id:'left', class:'vertically-centered'},
                m('img', {class:'frontImg', src:'./frontImg.jpg', alt:'TinyInsta front page image'}),
            ),
            m('div', {id:'right', class:'vertically-centered'},
                m('h1', "TinyGram"),
                /*m('button', {onclick:function (){
                        gapiRender('sign-in-login');
                    }},"create Login"),

                 */
                m('div', [
                    m('div', "Login with Google"),
                    m('div', {id : 'sign-in-login'}),
                ]),
                m('div', {class:'line'}),
                m('div', {class:'btnDiv'},[
                        m(m.route.Link,{href: "/profile/"+emailToUniqueName(Profile.email), class:'btn'}),
                ])
            ),
            m('div', {class:'signature'},
                m('p','Louis NORMAND, Rapha�l TENAUD  -Web & Cloud-'))
        ])
    }
}



