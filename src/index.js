import { GraphQLServer } from 'graphql-yoga';
import { v4 } from 'uuid';

// Demo users data
const users = [
  {
    id: '1',
    name: 'Jeff',
    email: 'Jeff@gmail.com',
  },
  {
    id: '2',
    name: 'Sarah',
    email: 'sarah@gmail.com',
    age: 22,
  },
  {
    id: '3',
    name: 'Lenny',
    email: 'lenny@gmail.com',
    age: 25,
  },
];

const posts = [
  {
    id: '1',
    title: 'Post Number 1',
    body: 'This is the first post. 1! zzz',
    published: true,
    author: '1',
  },
  {
    id: '2',
    title: 'Post Number 2',
    body: 'This is the second post. 2! zzz',
    published: true,
    author: '1',
  },
  {
    id: '3',
    title: 'Post Number 3',
    body: 'This is the third post. 3!',
    published: true,
    author: '2',
  },
];

const comments = [
  {
    id: '101',
    text: 'First comment',
    author: '3',
    postId: '1',
  },
  {
    id: '102',
    text: 'Second comment',
    author: '3',
    postId: '2',
  },
  {
    id: '103',
    text: 'Third comment',
    author: '2',
    postId: '2',
  },
  {
    id: '104',
    text: 'Fourth comment',
    author: '1',
    postId: '3',
  },
];

// Type Definitions (schema)
const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    me: User!
    post: Post!
    comments: [Comment!]!
  }

  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
    createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
    createComment(text: String!, author: ID!, post: ID!): Comment!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) return users;

      return users.filter((user) => {
        return user.name
          .toLocaleLowerCase()
          .includes(args.query.toLocaleLowerCase());
      });
    },

    posts(parent, args, ctx, info) {
      if (!args.query) return posts;

      return posts.filter((post) => {
        return (
          post.title
            .toLocaleLowerCase()
            .includes(args.query.toLocaleLowerCase()) ||
          post.body.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
        );
      });
    },

    me() {
      return {
        id: '123',
        name: 'Jeff',
        email: 'jeff@gmail.com',
      };
    },

    post() {
      return {
        id: '092',
        title: 'Basic GraphQL',
        body: 'Yet to be started',
        published: false,
      };
    },

    comments(parent, args, ctx, info) {
      return comments;
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.email);

      if (emailTaken) throw new Error('Email is already taken');

      const user = {
        id: v4(),
        name: args.name,
        email: args.email,
        age: args.age,
      };

      users.push(user);

      return user;
    },

    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.author);

      if (!userExists) throw new Error('That user does not exist.');

      const post = {
        id: v4(),
        title: args.title,
        body: args.body,
        published: args.published,
        author: args.author,
      };

      posts.push(post);

      return post;
    },

    createComment(parent, args, ctx, info) {
      const authorExists = users.some((user) => user.id === args.author);
      const postExists = posts.some((post) => post.id === args.post);
      console.log(args.post);

      if (!authorExists || !postExists)
        throw new Error('Either the author or post does not exist.');
      console.log(args);

      const comment = {
        id: v4(),
        text: args.text,
        post: args.post,
        author: args.author,
      };

      comments.push(comment);

      return comment;
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, cx, info) {
      return comments.filter((comment) => {
        return comment.postId === parent.id;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return parent.id === comment.author;
      });
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.postId;
      });
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(() => console.log('The server is running'));
