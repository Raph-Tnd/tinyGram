package foo;

import java.io.IOException;
import java.net.Inet4Address;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(
        name = "HelloWorld",
        urlPatterns = "/hello"
)
public class HelloWorld extends HttpServlet {
    int i=0;
    static int j=0;

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().print("Hello App Engine!\r\n");

    }
}