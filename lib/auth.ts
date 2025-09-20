import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Add your own logic here to validate credentials
        // This is a basic example - replace with your actual authentication logic
        if (credentials?.email === 'nealalim26@lebryne.com' && credentials?.password === 'admin') {
          return {
            id: '1',
            name: 'Admin User',
            email: 'nealalim26@lebryne.com',
            image: 'https://i.pravatar.cc/150?u=nealalim26@lebryne.com',
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});
