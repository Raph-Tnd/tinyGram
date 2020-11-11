var HomePage = {
    view: function(){
        return m('div', {class:'container'},[
            m('div', {id:'left', class:'vertically-centered'},
                m('img', {class:'frontImg', src:'./frontImg.jpg', alt:'TinyInsta front page image'}),
            ),
            m('div', {id:'right', class:'vertically-centered'},
                m('h1', "TinyGram"),
                m('div', {class:'g-signin2', "data-onsuccess":'onSignIn', "data-theme":'dark'}),
                m('div', {class:'line'}),
                m('div', {class:'btnDiv'},
                    m(m.route.Link,{href: "/profile/tenaudraphael", class:'btn'},"Profile")
                )
            ),
            m('div', {class:'signature'},
                m('p','Louis NORMAND, Rapha�l TENAUD  -Web & Cloud-'))
        ])
    }
}