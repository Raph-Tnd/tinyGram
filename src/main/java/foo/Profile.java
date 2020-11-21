package foo;

import java.util.HashSet;
import java.util.Set;

import com.google.appengine.api.datastore.Entity;


public class Profile {
    public String name;
    public String accountName;
    public String email;
    public String url;
    public String description;
    public Set<String> follows;
    public Set<String> followers;
    public final static String URL_IMAGE = "/img/hotface.png";

    public Profile(){
        this.email = null;
        this.accountName = null;
        this.description = null;
        this.name = null;
        this.url = null;
        this.follows = null;
        this.followers = null;
    }

    public Profile(String email){
        this.email = email;
        this.accountName = this.emailToUniqueName();
        this.description = "";
        this.name = this.accountName;
        this.url = URL_IMAGE;
        this.follows = new HashSet<>();
        this.followers = new HashSet<>();
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
        e.setProperty("accountName" , this.accountName);
        e.setProperty("name", this.name);
        e.setProperty("email", this.email);
        e.setProperty("url",this.url);
        e.setProperty("description",this.description);
        e.setProperty("follows",this.follows);
        e.setProperty("followers", this.followers);
        return e;
    }

}
