package foo;

import java.util.HashSet;
import java.util.Set;

import com.google.appengine.api.datastore.Entity;


public class Profile {
	
    private String name;
    private String email;
    private String url;
    private String description;
    private Set<String> followed;
    public final static String URL_IMAGE = "/img/hotface.png";

    public Profile(){ }

    public Profile(String email){
        this.email = email;
        this.name = this.emailToUniqueName();
        this.url = URL_IMAGE;
        this.followed = new HashSet<>();
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
    
    public boolean addFriend(Profile f) {
    	if(!f.getName().isEmpty()) {
    		return this.followed.add(f.email);
    	}
    	return false;
    }
    
    public boolean removeFriend(Profile f) {
    	if(!f.getName().isEmpty()) {
    		return this.followed.remove(f.getName());
    	}
    	return false;
    }

}
