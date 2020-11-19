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
    public CollectionResponse<Entity> getTimeline(User user, @Nullable @Named("next") String cursorString) throws EntityNotFoundException, UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Key profileKey = new Entity("Profile", user.getEmail().split("@")[0]).getKey();
        Entity profile = ds.get(profileKey);

        Object listFollow = profile.getProperty("followed");
        //si l'utilisateur ne follow personne
        if (listFollow == null){
            return null;
        }

        Query q = new Query("Post")
                .setFilter(new FilterPredicate("owner",FilterOperator.IN,(List<String>)listFollow))
                .addSort("date",SortDirection.DESCENDING);

        PreparedQuery pq = ds.prepare(q);

        FetchOptions fetchOptions = FetchOptions.Builder.withLimit(10);
        if (cursorString != null) {
            fetchOptions.startCursor(Cursor.fromWebSafeString(cursorString));
        }
        QueryResultList<Entity> results = pq.asQueryResultList(fetchOptions);
        cursorString = results.getCursor().toWebSafeString();

        return CollectionResponse.<Entity>builder().setItems(results).setNextPageToken(cursorString).build();
    }




}
