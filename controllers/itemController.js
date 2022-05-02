const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const async = require("async");

exports.index = function (req, res, next) {
  async.parallel(
    {
      item_count: function (callback) {
        Item.countDocuments({}, callback);
      },
      category_count: function (callback) {
        Category.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Your favorite inventory app",
        error: err,
        data: results,
      });
    }
  );
};

exports.item_list = function (req, res, next) {
  Item.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_items) {
      if (err) return next(err);
      res.render("item_list", { title: "Item List", item_list: list_items });
    });
};

exports.item_detail = function (req, res, next) {
  Item.findById(req.params.id)
    .populate("category")
    .exec(function (err, item) {
      if (err) return next(err);
      if (item == null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }

      res.render("item_detail", { title: "Item Detail", item: item });
    });
};

exports.item_create_get = function (req, res, next) {
  Category.find().exec(function (err, results) {
    if (err) return next(err);
    res.render("item_form", { title: "Create Item", categories: results });
  });
};

exports.item_create_post = [
  body("name", "Item name must be between 3 and 40 characters long")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body(
    "description",
    "Item description must be between 10 and 100 characters long"
  )
    .trim()
    .isLength({ min: 10, max: 100 })
    .escape(),
  body("category").escape(),
  body("price", "Price is required")
    .trim()
    .isLength({ min: 1, max: 10 })
    .escape(),
  body("in_stock", "Number in stock is required")
    .trim()
    .isLength({ min: 1, max: 10 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    let item;
    const category = Category.find({ name: req.body.category }).exec(function (
      err,
      results
    ) {
      if (err) return next(err);
      item = new Item({
        name: req.body.name,
        description: req.body.description,
        category: category,
        price: req.body.price,
        in_stock: req.body.in_stock,
      });
    });

    if (!errors.isEmpty()) {
      Category.find({}, "name").exec(function (err, results) {
        res.render("item_form", {
          title: "Create Items",
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          price: req.body.price,
          in_stock: req.body.in_stock,
          categories: results,
          errors: errors.array(),
        });
      });
      return;
    } else {
      item = new Item({
        name: req.body.name,
        description: req.body.desription,
        category: req.body.category,
        price: req.body.price,
        in_stock: req.body.in_stock,
      });
      Item.findOne({
        name: req.body.name,
      }).exec(function (err, found_item) {
        if (err) return next(err);
        if (found_item) res.redirect(found_item.url);
        else {
          item.save(function (err) {
            if (err) return next(err);
            res.redirect(item.url);
          });
        }
      });
    }
  },
];

exports.item_delete_get = function (req, res, next) {
  Item.findById(req.params.id).exec(function (err, results) {
    if (err) return next(err);
    if (results == null) res.redirect("/shop/items");
    res.render("item_delete", {
      title: "Delete Item",
      item: results,
    });
  });
};

exports.item_delete_post = function (req, res, next) {
  Item.findById(req.body.itemid).exec(function (err, results) {
    if (err) return next(err);
    if (results == null) {
      res.redirect("/shop/items");
      return;
    } else {
      Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) return next(err);
        res.redirect("/shop/items");
      });
    }
  });
};

exports.item_update_get = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
      categories: function (callback) {
        Category.find().exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.categories == null) {
        results.categories = [];
      }
      if (results.item == null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("item_form", {
        title: "Update Item",
        name: results.item.name,
        description: results.item.description,
        selectedCategory: results.item.category,
        price: results.item.price,
        in_stock: results.item.in_stock,
        categories: results.categories,
      });
    }
  );
};

exports.item_update_post = [
  body("name", "Item name must be between 3 and 40 characters long")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body(
    "description",
    "Item description must be between 10 and 100 characters long"
  )
    .trim()
    .isLength({ min: 10, max: 100 })
    .escape(),
  body("category").escape(),
  body("price", "Price is required")
    .trim()
    .isLength({ min: 1, max: 10 })
    .escape(),
  body("in_stock", "Number in stock is required")
    .trim()
    .isLength({ min: 1, max: 10 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    async.parallel(
      {
        item: function (callback) {
          Item.findById(req.params.id).exec(callback);
        },
        category: function (callback) {
          Category.find({ name: req.body.name }).exec(callback);
        },
        categories: function (callback) {
          Category.find().exec(callback);
        },
      },
      function (err, results) {
        if (err) return next(err);
        if (results.category == null) {
          const err = new Error("Invalid category");
          err.status = 404;
          return next(err);
        }
        const item = new Item({
          name: req.body.name,
          description: req.body.description,
          category: results.category,
          price: req.body.price,
          in_stock: req.body.in_stock,
          _id: results.item._id,
        });
        if (!errors.isEmpty()) {
          res.render("item_form", {
            title: "Update Item",
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            in_stock: item.in_stock,
            categories: results.categories,
          });
          return;
        } else {
          Item.findByIdAndUpdate(
            req.params.id,
            item,
            {},
            function (err, the_item) {
              if (err) return next(err);
              res.redirect(the_item.url);
            }
          );
        }
      }
    );
  },
];
