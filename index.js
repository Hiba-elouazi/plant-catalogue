const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/plant_catalogue', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(" MongoDB connection error:", err));

const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const plantSchema = new mongoose.Schema({
  name: String,
  description: String,
  waterNeeds: String,
  sunlight: String,
  season: String,
  image: String,
  type: {
    name: String
  }
});

const Plant = mongoose.model('Plant', plantSchema);

const typeDefs = gql`
  type PlantType {
    name: String!
  }

  type Plant {
    id: ID!
    name: String!
    description: String!
    waterNeeds: String!
    sunlight: String!
    season: String!
    image: String
    type: PlantType!
  }

  type Query {
    plants: [Plant!]!
    plant(id: ID!): Plant
  }

  type Mutation {
    addPlant(
      name: String!
      description: String!
      waterNeeds: String!
      sunlight: String!
      season: String!
      image: String
      typeName: String!
    ): Plant

    deletePlant(id: ID!): Boolean
  }

`;

const resolvers = {
  Query: {
    plants: async () => await Plant.find(),
    plant: async (_, { id }) => await Plant.findById(id)
  },
  Mutation: {
    addPlant: async (_, args) => {
      const newPlant = new Plant({
        name: args.name,
        description: args.description,
        waterNeeds: args.waterNeeds,
        sunlight: args.sunlight,
        season: args.season,
        image: args.image,
        type: { name: args.typeName }
      });
      return await newPlant.save();
    },

    deletePlant: async (_, { id }) => {
      const result = await Plant.findByIdAndDelete(id);
      return !!result;
    }
  }
};


async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('🚀 Server ready at http://localhost:4000/graphql');
  });
}

startServer();
