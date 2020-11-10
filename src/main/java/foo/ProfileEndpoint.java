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
import io.swagger.annotations.ApiParam;

import java.util.Date;


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
        Query q = new Query("Profile")
                .setFilter(new FilterPredicate("name",FilterOperator.EQUAL,profileName));
        PreparedQuery pq = ds.prepare(q);
        Entity profile = pq.asSingleEntity();
        return profile;
    }

    @ApiMethod(name = "createProfile", path = "profile/create", httpMethod = HttpMethod.POST)
    public Entity createProfile(User user) throws UnauthorizedException {
        Entity entityFound = null;
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }
        Entity e = new Profile(user.getEmail()).createEntity();
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
}
