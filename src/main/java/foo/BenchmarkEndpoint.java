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

public class BenchmarkEndpoint {
	
	@ApiMethod(name = "deleteProfile", path = "profile/deleteProfile", httpMethod = HttpMethod.DELETE)
	public void deleteProfile(User user) {
        Key key = KeyFactory.createKey("Profile", user.getEmail().split("@")[0] );
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        ds.delete(key);
	}
	
	@ApiMethod(name = "createFakeProfile", path = "profile/createFakeProfile/{nbProfile}", httpMethod = HttpMethod.POST)
	public void createFakeProfile(User user, @Named("nbProfile") String nbProfile) {
		for(int i=0; i<Integer.parseInt(nbProfile); i++) {
			Entity e = new Profile("mailFake.u"+i).createEntity();
			DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
			ds.put(e);
		}
	}
	
	@ApiMethod(name = "deleteFakeProfile", path = "profile/deleteFakeProfile/{nbProfile}", httpMethod = HttpMethod.POST)
	public void deleteFakeProfile(User user, @Named("nbProfile") String nbProfile) {
		for(int i=0; i<Integer.parseInt(nbProfile); i++) {
			Key key = KeyFactory.createKey("Profile","mailFake.u"+i);
			DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
			ds.delete(key);
		}
	}
	
	@ApiMethod(name = "fakeFollow", path = "profile/fakeFollow/{profileName}/{nbProfile}", httpMethod = HttpMethod.POST)
	public void fakeFollow(User user, @Named("profileName") String profileName, @Named("nbProfile") String nbProfile) throws EntityNotFoundException {
		for(int i=0; i<Integer.parseInt(nbProfile); i++) {
			DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
			Entity profileToFollow = ds.get(new Entity("Profile", profileName).getKey());
	        Entity profileFollowing = ds.get(new Entity("Profile", ("mailFake.u"+i)).getKey());
	        
	        Object items1 = profileToFollow.getProperty("followers");
	        String toPut = (String)profileFollowing.getProperty("name");
	        Collection<String> res1;
	        if(items1 == null){
	            res1 = new HashSet<String>();
	        }else{
	            res1 = (List<String>)items1;
	        }
	        if(res1.contains(toPut)){
	            res1.remove(toPut);
	        }else{
	            res1.add(toPut);
	        }

	        profileToFollow.setProperty("followers", res1);


	        //adding profile to user's follows
	        Object items2 = profileFollowing.getProperty("follows");
	        toPut = (String)profileToFollow.getProperty("name");
	        Collection<String> res2;
	        if(items2 == null){
	            res2 = new HashSet<String>();
	        }else{
	            res2 = (List<String>)items2;
	        }
	        if(res2.contains(toPut)){
	            res2.remove(toPut);
	        }else{
	            res2.add(toPut);
	        }
	        profileFollowing.setProperty("follows", res2);

	        Transaction txn = ds.beginTransaction();
	        ds.put(profileToFollow);
	        ds.put(profileFollowing);
	        txn.commit();
	        
		}
	}

	@ApiMethod(name = "postFake", path = "profile/postFake/{profileName}/{nbPost}", httpMethod = HttpMethod.POST)
	public void postFake(User user, @Named("profileName") String profileName, @Named("nbPost") String nbPost) {
		for(int i=0; i<Integer.parseInt(nbPost); i++) {
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			Entity e = new Entity("Post", Long.MAX_VALUE - (new Date()).getTime() + ":" + profileName);
			e.setProperty("owner", profileName);
			e.setProperty("url", "https://imgr.cineserie.com/2019/03/terminator-6-on-connait-le-titre-officiel-2.jpg?imgeng=/f_jpg/cmpr_0/w_660/h_370/m_cropbox&ver=1");
			e.setProperty("body", "Je suis un T800 venu détruire votre civilisation");
			e.setProperty("likec", 0);
			e.setProperty("likel", new HashSet<String>() );
			e.setProperty("date", new Date() );
			datastore.put(e);
		}
	}
}




