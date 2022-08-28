const { User, Book } = require('../models')
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {

    Query: {
        users: async () => {
            return await User.find()
        }
    },

    Mutation: {
        login: async (parent, { email, password }, context) => {
            const user = await User.findOne({ email });//email:email, findone expects obj structure  {email} is a shorthand, condensed version

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            //await AsyncStorage.removeItem("token");
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { id: context.user.id },
                    { $addToSet: { savedBooks: { ...args, } } },
                    { new: true, validators: true }
                )
                const token = signToken(user);
                return { token, user };
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { id: context.user.id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true, validators: true }
                )
                const token = signToken(user);
                return { token, user };
            }
            throw new AuthenticationError('You need to be logged in!');
        }

    }


};

module.exports = resolvers;