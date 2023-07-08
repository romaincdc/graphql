// Import des dépendances
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import mongoose from 'mongoose'

// Connexion à la base de données
await mongoose.connect('mongodb://localhost:27017/delivecrous')

// Definition d'un model de base de données
const Dish = mongoose.model('Dish', {
    name: String,
    description: String,
    allergene: String,
    price: Number,
    available: Boolean,
    srcImg: String,
  })
const Cart = mongoose.model('Cart', {
    dishes: [Dish.schema],
    address: String,
    zipcode: Number,
    city: String,
    phone: Number,
})


  // Nous verrons plus tard ce que sont les typeDefs et resolvers
const typeDefs = `#graphql
  type Dish {
    id: ID!
    name: String
    description: String
    allergene: String
    price: Int
    available: Boolean
    srcImg: String
  }
  type Cart {
    id: ID!
    dishes: [Dish]
    address: String
    zipcode: Int
    city: String
    phone: Int
    }

  type Query {
    dishs: [Dish]
    dish(id: ID!): Dish
    cart(id: ID!): Cart
    carts: [Cart]
  }

  type Mutation {
    addDish(name: String, description: String, allergene: String, price: Int!, available: Boolean, srcImg: String): Dish
    updateDish(id: ID!, name: String, description: String, allergene: String, price: Int!, available: Boolean, srcImg: String): Dish
    deleteDish(id: ID!): Dish
    initCart: Cart
    addDishToCart(id: ID!, dishId: ID!): Cart
    removeDishFromCart(id: ID!, dishId: ID!): Cart
    updateCart(id: ID!, address: String, zipcode: Int, city: String, phone: Int): Cart
    deleteCart(id: ID!): Cart

  }
`

// On laisse l'objet vide pour le moment
const resolvers = {
    Query: {
      dishs: async () => {
        return await Dish.find()
      },
      dish: async (parent, args) => {
        const { id } = args
        const dish = await Dish.findById(id)
        return dish
      },
       cart: async (parent, args) => {
         const { id } = args
         const cart = await Cart.findById(id)
         return cart
        },
    },
  
    Mutation: {
      addDish: async (parent, args) => {
        const { name, description, allergene, price, available, srcImg } = args
        const newDish = new Dish({
          name,
          description,
          allergene,
          price,
          available,
          srcImg,
        })
        await newDish.save()
        return newDish
      },
      updateDish: async (parent, args) => {
        const { id, name, description, allergene, price, available, srcImg } = args
        const dish = await Dish.findOneAndUpdate(
          { _id: id },
          {
            name,
            description,
            allergene,
            price,
            available,
            srcImg,
          },
          { new: true }
        )
  
        return dish
      },
      deleteDish: async (parent, args) => {
        const { id } = args
        const dish = await Dish.findOneAndDelete({ _id: id })
        return dish
      },
        initCart: async (parent, args) => {
            const newCart = new Cart({
                dishes: [],
                
                address: '',
                zipcode: 0,
                city: '',
                phone: 0,
            })
            await newCart.save()
            return newCart
            },
        addDishToCart: async (parent, args) => {
            const { id, dishId } = args
            const cart = await Cart.findById(id)
            const dish = await Dish.findById(dishId)
            cart.dishes.push(dish)
            await cart.save()
            return cart
            },
        removeDishFromCart: async (parent, args) => {
            const { id, dishId } = args
            const cart = await Cart.findOneAndUpdate(
                { _id: id },
                { $pull: { dishes: dishId } },
                { new: true }
            )
            return cart
            },
        updateCart: async (parent, args) => {
            const { id, address, zipcode, city, phone } = args
            const cart = await Cart.findOneAndUpdate(
                { _id: id },
                {
                    
                    address,
                    zipcode,
                    city,
                    phone,
                },
                { new: true }
            )
            return cart
            },
        deleteCart: async (parent, args) => {
            const { id } = args
            const cart = await Cart.findByIdAndDelete(id)
            return cart
    },
  },
}

// Création de l'instance Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// Démarrage du serveur
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

// Message de confirmation que le serveur est bien lancé
console.log(`🚀  Le serveur tourne sur: ${url}`)