#! /usr/bin/env node

console.log(
  "This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

const userArgs = process.argv.slice(2);

const async = require("async");
const Item = require("./models/item");
const Category = require("./models/category");

const mongoose = require("mongoose");
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const items = [];
const categories = [];

function categoryCreate(name, description, cb) {
  const category = new Category({ name: name, description: description });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, category, price, in_stock, cb) {
  const item = new Item({ name, description, category, price, in_stock });

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "Vegetables",
          "Only the finest vegetables in the north.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Snacks",
          "Perfect for a party or a relaxing Friday night.",
          callback
        );
      },
      function (callback) {
        categoryCreate("Deli", "Local meats of exquisite quality", callback);
      },
      function (callback) {
        categoryCreate("Bread", "Made with flour from a nearby mill", callback);
      },
    ],
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Cucumber",
          "Grown in Spain.",
          categories[0],
          1.5,
          10,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Carrot",
          "Stolen from a rabbit",
          categories[0],
          1.2,
          12,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Chips",
          "Sourcream and Onion flavored",
          categories[1],
          2.2,
          16,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Sprite",
          "Wonderfully fizzy soft drink",
          categories[1],
          1.3,
          22,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Prosciutto",
          "Specially prepared Italian ham",
          categories[2],
          2.75,
          10,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Baguette",
          "From France with love",
          categories[3],
          1.8,
          500,
          callback
        );
      },
    ],
    cb
  );
}

async.series([createCategories, createItems], function (err, results) {
  if (err) console.log("FINAL ERR: " + err);
  else console.log("Items created.");
  mongoose.connection.close();
});
