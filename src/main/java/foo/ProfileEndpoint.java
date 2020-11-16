package foo;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.User;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.repackaged.com.google.protobuf.ListValue;
import io.swagger.annotations.ApiParam;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Api(name = "myApi",
        version = "v1",
        audiences = "1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com",
        clientIds = "1067622413243-kjhodo8vcomp32b0bpi84m47blnvkc1r.apps.googleusercontent.com",
        namespace =
        @ApiNamespace(
                ownerDomain = "https://tinygram-1.ew.r.appspot.com/",
                ownerName = "https://tinygram-1.ew.r.appspot.com/",
                packagePath = "")
)

public class ProfileEndpoint {

    @ApiMethod(name = "getProfile", path = "profile/get/{profileName}",httpMethod = HttpMethod.GET)
    public Entity getProfile(User user, @Named("profileName") String profileName) throws EntityNotFoundException {
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Key profileKey = new Entity("Profile", profileName).getKey();
        Entity profile = ds.get(profileKey);
        return profile;
    }

    @ApiMethod(name = "createProfile", path = "profile/create", httpMethod = HttpMethod.POST)
    public Entity createProfile(User user) throws UnauthorizedException {
        Entity entityFound = null;
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }
        Entity e = new Profile(user.getEmail()).createEntity();
        e.setProperty("followers", new ArrayList<String>());
        e.setProperty("followed", new ArrayList<String>());
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        try{
            entityFound = ds.get(e.getKey());
        }
        catch (EntityNotFoundException exc) {
            entityFound = null;
        }
        if (entityFound == null){
            ds.put(e);
            return e;
        }else{
            return entityFound;
        }
    }


    public void addProfileToFollower(Entity profile, Entity toFollow){
        //profile follow toFollow
        ArrayList<String> items = (ArrayList<String>)toFollow.getProperty("followers");
        items.add((String)profile.getProperty("name"));
        toFollow.setProperty("followers", items);
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Transaction txn = ds.beginTransaction();
        ds.put(toFollow);
        txn.commit();
    }

    public void addProfileToFollowed(Entity profile, Entity following){
        //profile is being followed by beingFollowed
        ArrayList<String> items = (ArrayList<String>)profile.getProperty("followed");
        items.add((String)following.getProperty("name"));
        profile.setProperty("followed", items);
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Transaction txn = ds.beginTransaction();
        ds.put(profile);
        txn.commit();
    }

    @ApiMethod(name = "followProfile", path = "profile/{profileName}/follow", httpMethod = HttpMethod.POST)
    public void followProfile(User user, @Named("profileName") String profileName) throws UnauthorizedException {
        if (user == null){
            throw new UnauthorizedException("Invalid credentials");
        }
        String userName =user.getEmail().split("@")[0];
        if ( userName == profileName){
            throw new UnauthorizedException("Can't follow yourself");
        }
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Query q = new Query("Profile")
                .setFilter(new FilterPredicate("name", FilterOperator.EQUAL, profileName));
        PreparedQuery pq = ds.prepare(q);
        Entity profileToFollow = pq.asSingleEntity();

        q = new Query("Profile")
                .setFilter(new FilterPredicate("name", FilterOperator.EQUAL, userName));
        pq = ds.prepare(q);
        Entity profileFollowing = pq.asSingleEntity();

        addProfileToFollowed(profileFollowing, profileToFollow);
        addProfileToFollower(profileToFollow, profileFollowing);
    }
}
