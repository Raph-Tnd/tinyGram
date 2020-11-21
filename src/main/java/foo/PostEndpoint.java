package foo;

import com.google.api.server.spi.config.*;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.api.server.spi.auth.common.User;

import java.util.*;

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

public class PostEndpoint {



	@ApiMethod(name = "mypost", httpMethod = HttpMethod.GET)
	public CollectionResponse<Entity> mypost(@Named("name") String name, @Nullable @Named("next") String cursorString) {

	    Query q = new Query("Post").setFilter(new FilterPredicate("owner", FilterOperator.EQUAL, name));

	    // https://cloud.google.com/appengine/docs/standard/python/datastore/projectionqueries#Indexes_for_projections
	    //q.addProjection(new PropertyProjection("body", String.class));
	    //q.addProjection(new PropertyProjection("date", java.util.Date.class));
	    //q.addProjection(new PropertyProjection("likec", Integer.class));
	    //q.addProjection(new PropertyProjection("url", String.class));

	    // looks like a good idea but...
	    // generate a DataStoreNeedIndexException -> 
	    // require compositeIndex on owner + date
	    // Explosion combinatoire.
	    // q.addSort("date", SortDirection.DESCENDING);
	    
	    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	    PreparedQuery pq = datastore.prepare(q);
	    
	    FetchOptions fetchOptions = FetchOptions.Builder.withLimit(2);
	    
	    if (cursorString != null) {
		fetchOptions.startCursor(Cursor.fromWebSafeString(cursorString));
		}
	    
	    QueryResultList<Entity> results = pq.asQueryResultList(fetchOptions);
	    cursorString = results.getCursor().toWebSafeString();
	    
	    return CollectionResponse.<Entity>builder().setItems(results).setNextPageToken(cursorString).build();
	    
	}
    
	@ApiMethod(name = "getPost", path="profile/{username}/post",httpMethod = HttpMethod.GET)
	public CollectionResponse<Entity> getPost(User user, @Nullable @Named("next") String cursorString, @Named("username") String username)
			throws UnauthorizedException {

		Query q = new Query("Post").
		    setFilter(new FilterPredicate("owner", FilterOperator.EQUAL, username));

		// Multiple projection require a composite index
		// owner is automatically projected...
		// q.addProjection(new PropertyProjection("body", String.class));
		// q.addProjection(new PropertyProjection("date", java.util.Date.class));
		// q.addProjection(new PropertyProjection("likec", Integer.class));
		// q.addProjection(new PropertyProjection("url", String.class));

		// looks like a good idea but...
		// require a composite index
		// - kind: Post
		//  properties:
		//  - name: owner
		//  - name: date
		//    direction: desc

		// q.addSort("date", SortDirection.DESCENDING);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);

		FetchOptions fetchOptions = FetchOptions.Builder.withLimit(2);

		if (cursorString != null) {
			fetchOptions.startCursor(Cursor.fromWebSafeString(cursorString));
		}

		QueryResultList<Entity> results = pq.asQueryResultList(fetchOptions);
		cursorString = results.getCursor().toWebSafeString();

		return CollectionResponse.<Entity>builder().setItems(results).setNextPageToken(cursorString).build();
	}

	@ApiMethod(name = "postMsg", path="postMsg", httpMethod = HttpMethod.POST)
	public Entity postMsg(User user, PostMessage pm) throws UnauthorizedException {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		if (user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}


		Entity e = new Entity("Post", Long.MAX_VALUE - (new Date()).getTime() + ":" + user.getEmail());
		e.setProperty("owner", user.getEmail().split("@")[0]);
		e.setProperty("url", pm.url);
		e.setProperty("body", pm.body);
		e.setProperty("likec", 0);
		e.setProperty("likel", new HashSet<String>() );
		e.setProperty("date", new Date() );
///		Solution pour pas projeter les listes
//		Entity pi = new Entity("PostIndex", e.getKey());
//		HashSet<String> rec=new HashSet<String>();
//		pi.setProperty("receivers",rec);

		datastore.put(e);
//		datastore.put(pi);
		return e;

	}

	@ApiMethod(name = "deleteMsg", path = "deleteMsg/{keyPost}",httpMethod = HttpMethod.DELETE)
	public Entity deleteMsg(User user, @Named("keyPost") String keyPost) throws UnauthorizedException, EntityNotFoundException {
		if (user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Key toRemove = new Entity("Post",keyPost).getKey();
		Entity post = ds.get(toRemove);
		ds.delete(toRemove);
		return post;
	}
  
	@ApiMethod(name = "likePost", path = "likePost/{keyPost}",httpMethod = HttpMethod.POST)
	public Entity likePost(User user, @Named("keyPost") String keyPost) throws UnauthorizedException, EntityNotFoundException {
		if (user == null) {
			throw new UnauthorizedException("Invalid credentials");
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Key keypost = new Entity("Post",keyPost).getKey();
		Entity post = ds.get(keypost);


		Collection<String> listLike ;
		Object precastList = post.getProperty("likel");
		if ( precastList == null ) {
			listLike = new HashSet<String>();
		} else {
			listLike = (List<String>)precastList;
		}

		long nbLike = (long) post.getProperty("likec");

		String userLiking = user.getEmail().split("@")[0];

		if (listLike.contains(userLiking)) {
			listLike.remove(userLiking);
			nbLike -= 1;
		} else {
			listLike.add(userLiking);
			nbLike += 1;
		}

		Transaction txn = ds.beginTransaction();
		post.setProperty("likel", listLike);
		post.setProperty("likec", nbLike);
		ds.put(post);
		txn.commit();

		return post;
	}
}
