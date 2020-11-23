package foo;

import com.google.api.server.spi.config.*;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.users.User;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query.SortDirection;
import io.swagger.annotations.ApiParam;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
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

public class TimelineEndpoint {

    @ApiMethod(name = "getTimeline", path = "timeline",httpMethod = HttpMethod.GET)
    public CollectionResponse<Entity> getTimeline(User user) throws EntityNotFoundException, UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }
        Entity debug;
        ArrayList<Entity> collectionDebug = new ArrayList<Entity>();

        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

        Key profileKey = new Entity("Profile", user.getEmail().split("@")[0]).getKey();
        Entity profile = ds.get(profileKey);

        if(profile == null){
            debug = new Entity("response");
            debug.setProperty("message","User's profile not found");
            collectionDebug.add(debug);
            return CollectionResponse.<Entity>builder().setItems(collectionDebug).build();
        }

        Object listFollow = profile.getProperty("follows");
        //si l'utilisateur ne follow personne
        if (listFollow == null){
            debug = new Entity("response");
            debug.setProperty("message","Pas de followers");
            collectionDebug.add(debug);
            return CollectionResponse.<Entity>builder().setItems(collectionDebug).build();
        }
        List<String> listOfFollow = (List<String>)listFollow;
        QueryResultList<Entity> results = null;
        PreparedQuery pq;
        for (String follow : listOfFollow){
            Query q = new Query("Post")
                    .setFilter(new FilterPredicate("owner", FilterOperator.EQUAL, follow))
                    .addSort("date",SortDirection.DESCENDING);
            pq = ds.prepare(q);

            FetchOptions fetchOptions = FetchOptions.Builder.withLimit(10);
            if ( results == null){
                results = pq.asQueryResultList(fetchOptions);
            }else{
                results.addAll(pq.asQueryResultList(fetchOptions));
            }
        }

        return CollectionResponse.<Entity>builder().setItems(results).build();
    }

}
