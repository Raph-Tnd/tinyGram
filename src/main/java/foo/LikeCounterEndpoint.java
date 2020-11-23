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

import java.util.Random;


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



public class LikeCounterEndpoint {

    public static int nbLikeList = 25;
    Random r = new Random();

    @ApiMethod(name = "createLike", path = "createPostLike/{postMsgKey}", httpMethod = HttpMethod.POST)
    public Entity createLike(User user, @Named("postMsgKey") String postMsgKey) throws UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }

        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

        //creation 25 entity likeCounter pour le nb de like
        for (int i = 0; i < nbLikeList; i++){
            String key = postMsgKey+i;
            Entity likeCounter = new Entity("Likec",key);
            likeCounter.setProperty("post", postMsgKey);
            likeCounter.setProperty("counter", 0);
            ds.put(likeCounter);
        }

        Entity response = new Entity("response");
        response.setProperty("message", "25 like created");
        return response;
    }

    @ApiMethod(name = "deleteLike", path = "deleteLike/{keyPost}", httpMethod = HttpMethod.DELETE)
    public Entity deleteLike(User user, @Named("keyPost") String keyPost) throws UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }

        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        //supprimer les liaisons Post-Profile
        Query postProfile = new Query("LikePerson")
                .setFilter(new FilterPredicate("post",FilterOperator.EQUAL,keyPost));
        PreparedQuery pqProfile = ds.prepare(postProfile);
        for (Entity en : pqProfile.asIterable()){
            ds.delete(en.getKey());
        }

        //Supprimer les 25 entity like
        Query likeCount = new Query("Likec")
                .setFilter(new FilterPredicate("post",FilterOperator.EQUAL, keyPost));

        PreparedQuery pqCounter = ds.prepare(likeCount);
        for (Entity en : pqCounter.asIterable()){
            ds.delete(en.getKey());
        }

        Entity response = new Entity("response");
        response.setProperty("message", "25 like deleted");
        return response;
    }

    @ApiMethod(name = "getLike", path = "getLike/{keyPost}", httpMethod = HttpMethod.GET)
    public Entity getLike(User user, @Named("keyPost") String keyPost) throws EntityNotFoundException {
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        Query q = new Query("Likec")
                .setFilter(new FilterPredicate("post",FilterOperator.EQUAL, keyPost));

        PreparedQuery pq = ds.prepare(q);
        long nbLike = 0;
        for (Entity en : pq.asIterable()){
            nbLike += (long)en.getProperty("counter");
        }
        Entity response = new Entity("Response");
        response.setProperty("likec", nbLike);
        return response;
    }

    @ApiMethod(name = "getLikePerson", path = "getLikePerson/{keyPost}/", httpMethod = HttpMethod.GET)
    public Entity getLikePerson(User user, @Named("keyPost") String keyPost) throws UnauthorizedException {
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }
        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
        String userName = user.getEmail().split("@")[0];
        Entity response = new Entity("Response");
        try {
            Query q = new Query("LikePerson")
                    .setFilter(new FilterPredicate("post", FilterOperator.EQUAL, keyPost))
                    .setFilter(new FilterPredicate("profile", FilterOperator.EQUAL, userName));
            PreparedQuery pq = ds.prepare(q);
            Entity personPostLiked = pq.asSingleEntity();
            if (personPostLiked == null){
                response.setProperty("hasLiked", "false");
            }else{
                response.setProperty("hasLiked", "true");
            }
        }
        catch(Exception e){
            response.setProperty("hasLiked", "false");
        }
        return response;
    }

    @ApiMethod(name = "likePost", path = "likePost/{keyPost}", httpMethod = HttpMethod.PUT)
    public Entity likePost(User user, @Named("keyPost") String keyPost) throws UnauthorizedException, EntityNotFoundException {
        if (user == null) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String userName = user.getEmail().split("@")[0];
        int random = r.nextInt(nbLikeList);
        while( random > 24 || random < 0 ){
            random = r.nextInt(nbLikeList);
        }

        DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

        Entity likePerson;
        try {
            //fetch if user has liked the post
            Query q = new Query("LikePerson")
                    .setFilter(new FilterPredicate("post",FilterOperator.EQUAL,keyPost))
                    .setFilter(new FilterPredicate("profile",FilterOperator.EQUAL,userName));
            PreparedQuery pq = ds.prepare(q);
            likePerson = pq.asSingleEntity();
        }
        catch( Exception e){
            likePerson = null;
        }

        //fetch an Entity likeCounter
        String postLikeCounterRandom = keyPost+random;
        Key likeCounterKey = KeyFactory.createKey("Likec",postLikeCounterRandom);
        Entity ownLikeCounter;
        try{
            ownLikeCounter = ds.get(likeCounterKey);
        }
        catch( EntityNotFoundException e ){
            Entity response = new Entity("Response");
            response.setProperty("message", postLikeCounterRandom);
            return response;
        }

        long nbLike = (long)ownLikeCounter.getProperty("counter");
        //si la personne n'avait pas like le post
        if(likePerson == null){
            //creation de la liaison Profile-Post pour savoir qui a liker le post
            Entity personJoinPost = new Entity("LikePerson",keyPost+userName);
            personJoinPost.setProperty("profile",userName);
            personJoinPost.setProperty("post", keyPost);
            ds.put(personJoinPost);
            nbLike++;
        }else{
            ds.delete(likePerson.getKey());
            nbLike--;
        }
        ownLikeCounter.setProperty("counter",nbLike);
        ds.put(ownLikeCounter);

        //reload all like
        Query qLike = new Query("Likec")
                .setFilter(new FilterPredicate("post",FilterOperator.EQUAL, keyPost));

        PreparedQuery pqLike = ds.prepare(qLike);
        long nbLikeResponse = 0;
        for (Entity en : pqLike.asIterable()){
            nbLikeResponse += (long)en.getProperty("counter");
        }
        Entity response = new Entity("response");
        response.setProperty("likec", nbLikeResponse);
        response.setProperty("key",keyPost);

        return response;

    }
}
