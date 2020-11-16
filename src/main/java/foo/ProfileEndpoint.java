package foo;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.users.User;
import java.util.HashSet;


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
        e.setProperty("followers", new HashSet<String>());
        e.setProperty("followed", new HashSet<String>());
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

    @ApiMethod(name = "followProfile", path = "profile/{profileName}/follow", httpMethod = HttpMethod.POST)
    public Entity followProfile(User user, @Named("profileName") String profileName) throws UnauthorizedException {
        if (user == null){
            throw new UnauthorizedException("Invalid credentials");
        }

        String userName =user.getEmail().split("@")[0];

        if ( userName == profileName){
            throw new UnauthorizedException("Can't follow yourself");
        }
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Query q1 = new Query("Profile")
                .setFilter(new FilterPredicate("name", FilterOperator.EQUAL, profileName));
        PreparedQuery pq1 = ds.prepare(q1);
        Entity profileToFollow = pq1.asSingleEntity();

        Query q2 = new Query("Profile")
                .setFilter(new FilterPredicate("name", FilterOperator.EQUAL, userName));
        PreparedQuery pq2 = ds.prepare(q2);
        Entity profileFollowing = pq2.asSingleEntity();

        //adding user to profile's followers
        Object items1 = profileToFollow.getProperty("followers");
        String toPut = (String)profileFollowing.getProperty("name");
        HashSet<String> res1;
        if(items1 == null){
            res1 = new HashSet<String>();
            res1.add(toPut);
        }else{
            res1 = (HashSet<String>)items1;
            res1.add(toPut);
        }
        profileToFollow.setProperty("followers", res1);



        //adding profile to user's followed
        Object items2 = profileFollowing.getProperty("followed");
        toPut = (String)profileToFollow.getProperty("name");
        HashSet<String> res2;
        if(items2 == null){
            res2 = new HashSet<String>();
            res2.add(toPut);
        }else{
            res2 = (HashSet<String>)items2;
            res2.add(toPut);
        }
        profileFollowing.setProperty("followed", res2);


        Transaction txn = ds.beginTransaction();
        ds.put(profileToFollow);
        ds.put(profileFollowing);
        txn.commit();



        return profileFollowing;
    }
}
