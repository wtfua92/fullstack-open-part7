require('dotenv').config();
const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Book = require('./models/Book.model');
const Author = require('./models/Author.model');
const User = require('./models/User.model');

const pubsub = new PubSub();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('DB connected');
    });

const typeDefs = gql`
  type Author {
    name: String!
    born: Int,
    bookCount: Int,
    id: ID!
  }
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!,
    id: ID!
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
        author: String 
        genre: String
    ): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book!
    editAuthor(
        name: String!
        setToBorn: Int!
    ): Author
    addAuthor(
      name: String!
      born: Int
    ): Author
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
  }
  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
    Query: {
        bookCount: () => Book.find({}).countDocuments(),
        authorCount: () => Author.find({}).countDocuments(),
        allBooks: async (_, { author, genre }) => {
            if (author && genre) {
                const authorId = await Author.findOne({ name: author }).select('_id');
                return Book.find({genres: genre, author: authorId}).populate('author');
            } else if (genre) {
                return Book.find({ genres: genre }).populate('author');
            } else if (author) {
                const authorId = await Author.findOne({ name: author }).select('_id');
                return Book.find({ author: authorId }).populate('author');
            }
            return Book.find({}).populate('author');
        },
        allAuthors: () => Author.find({}),
        me: (_, __, { currentUser }) => {
            return currentUser;
        }
    },
    Mutation: {
        addBook: async (_, { title, author, published, genres }, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('You must be logged in to proceed');
            }
            try {
                const newBook = new Book ({
                    title,
                    published,
                    genres
                });
                let authorId = await Author.findOne({name: author}).select('_id');
                if (!authorId) {
                    const newAuthor = new Author({ name: author });
                    await newAuthor.save();
                    authorId = newAuthor._id;
                }
                newBook.author = authorId;
                await newBook.save();
                const bookAdded = await Book.findOne({ title }).populate('author');
                await pubsub.publish('BOOK_ADDED', { bookAdded });
                return bookAdded;
            } catch (e) {
                throw new UserInputError(e.message);
            }
        },
        editAuthor: async (_, {name, setToBorn}, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('You must be logged in to proceed');
            }
            console.log(name, setToBorn);
            let authorExists = await Author.findOne({name});
            if (authorExists) {
                try {
                    return Author.findOneAndUpdate({ name }, { born: setToBorn }, { new: true });
                } catch (e) {
                    throw new UserInputError(e.message)
                }
            }
            return null;
        },
        addAuthor: (_, args) => {
            try {
                const newAuthor = new Author({
                    ...args
                });

                return newAuthor.save();
            } catch (e) {
                throw new UserInputError(e.message);
            }
        },
        createUser: (_, { username, favoriteGenre }) => {
            const newUser = new User({
                username,
                favoriteGenre
            });

            return newUser.save();
        },
        login: async (_, { username, password }) => {
            const user =  await User.findOne({ username });
            if (!user || password !== password) {
                throw new UserInputError('wrong credentials');
            }
            const userForToken = {
                username: user.username,
                id: user._id
            };

            return { value: jwt.sign(userForToken, process.env.JWT_SECRET)};
        }
    },
    Author: {
        bookCount: async ({name}) => {
            const author = await Author.findOne({name}).select('_id');
            return Book.find({ author }).countDocuments();
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req && req.headers.authorization ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer')) {
            const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
            const currentUser = await User.findById(decodedToken.id);
            return { currentUser };
        }
    }
});

server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
});