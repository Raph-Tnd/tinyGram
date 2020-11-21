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
	@ApiMethod(name = "createFakeProfile", path = "profile/createFake/{nbProfile}", httpMethod = HttpMethod.POST)
	public Entity createFakeProfile(User user, int nbProfile) {
		Entity e = new Profile("mailFake.u-1").createEntity();;
		for(int i=0; i<nbProfile; i++) {
			e = new Profile("mailFake.u"+i).createEntity();
			DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
			ds.put(e);
		}
		return e;
	}
}




