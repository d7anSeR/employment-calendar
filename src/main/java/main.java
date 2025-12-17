import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class main {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("fnnvvdf");
        System.out.println(hash);
    }
}
