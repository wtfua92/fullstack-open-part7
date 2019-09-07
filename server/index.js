require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const Book = require('./models/Book.model');
const Author = require('./models/Author.model');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('DB connected');
    });

//     {
//         title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//         published: 2012,
//         author: 'Sandi Metz',
//         id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//         genres: ['refactoring', 'design']
//     },
//     {
//         title: 'Crime and punishment',
//         published: 1866,
//         author: 'Fyodor Dostoevsky',
//         id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//         genres: ['classic', 'crime']
//     },
//     {
//         title: 'The Demon',
//         published: 1872,
//         author: 'Fyodor Dostoevsky',
//         id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//         genres: ['classic', 'revolution']
//     },
// ];

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
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
        author: String 
        genre: String
    ): [Book!]!
    allAuthors: [Author!]!
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
        allAuthors: () => Author.find({})
    },
    Mutation: {
        addBook: async (_, { title, author, published, genres }) => {
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
            return Book.findOne({ title }).populate('author');
        },
        editAuthor: async (_, {name, setToBorn}) => {
            let authorExists = await Author.findOne({name});
            if (authorExists) {
                return Author.findOneAndUpdate({ name }, { born: setToBorn }, { new: true });
            }
            return null;
        },
        addAuthor: (_, args) => {
            const newAuthor = new Author({
                ...args
            });

            return newAuthor.save();
        }
    },
    Author: {
        bookCount: async ({name}) => {
            const author = await Author.findOne({name}).select('_id');
            return Book.find({ author }).countDocuments();
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
});