package foo;

import com.google.appengine.api.datastore.Entity;

public class Profile {
    private String name;
    private String email;
    private String ID;
    private String url;
    private String description;

    public Profile(){ }

    public String emailToUniqueName(){
        String res = this.email.split("@")[0];
        return res;
    }

    public String getName(){
        return name;
    }

    public String getEmail(){
        return email;
    }

    public String getID(){
        return ID;
    }

    public String getUrl(){
        return url;
    }

    public String getDescription(){
        return description;
    }

    public Entity createEntity(){
        Entity e = new Entity("Profile",this.emailToUniqueName());
        e.setProperty("name" , this.name);
        e.setProperty("email", this.email);
        e.setProperty("ID", this.ID);
        e.setProperty("url",this.url);
        e.setProperty("description",this.description);

        return e;
    }
}
