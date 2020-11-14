package foo;

import com.google.appengine.api.datastore.Entity;


public class Profile {
    private String name;
    private String email;
    private String url;
    private String description;
    public final static String URL_IMAGE = "/img/hotface.png";

    public Profile(){ }

    public Profile(String email){
        this.email = email;
        this.name = this.emailToUniqueName();
        this.url = URL_IMAGE;
    }

    public String emailToUniqueName(){
        String res = this.email.split("@")[0];
        return res;
    }

    public void setDescription(String desc){
        this.description = desc;
    }

    public Entity createEntity(){
        Entity e = new Entity("Profile",this.emailToUniqueName());
        e.setProperty("name" , this.name);
        e.setProperty("email", this.email);
        e.setProperty("url",this.url);
        e.setProperty("description",this.description);
        return e;
    }

    public String getName(){
        return name;
    }

    public String getEmail(){
        return email;
    }

    public String getUrl(){
        return url;
    }

    public String getDescription(){
        return description;
    }

}
