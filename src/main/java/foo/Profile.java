package foo;

import java.util.HashSet;
import java.util.Set;

import com.google.appengine.api.datastore.Entity;


public class Profile {

    private String accountName;
    private String email;
    private String url;
    private String description;
    private Set<String> follows;
    private Set<String> followers;
    public final static String URL_IMAGE = "/img/hotface.png";

    public Profile(){ }

    public Profile(String email){
        this.email = email;
        this.accountName = this.emailToUniqueName();
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
        e.setProperty("email", this.email);
        e.setProperty("url",this.url);
        e.setProperty("description",this.description);
        e.setProperty("follows",this.follows);
        e.setProperty("followers", this.followers);
        return e;
    }

    public String getAccountName(){
        return accountName;
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

    public Set<String> getFollowers(){
        return followers;
    }
}
