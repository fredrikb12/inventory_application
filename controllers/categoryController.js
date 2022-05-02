const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.category_list = function (req, res, next) {
  Category.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_categories) {
      if (err) return next(err);

      res.render("category_list", {
        title: "Category List",
        category_list: list_categories,
      });
    });
};

exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        const err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }

      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.category_create_get = function (req, res) {
  res.render("category_form", { title: "Create Category" });
};

exports.category_create_post = [
  body("name", "Category name must be between 3 and 40 characters long")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body(
    "description",
    "Category description must be between 10 and 100 characters long"
  )
    .trim()
    .isLength({ min: 10, max: 100 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category: req.body.name,
        description: req.body.description,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: req.body.name }).exec(function (
        err,
        found_category
      ) {
        if (err) return next(err);
        if (found_category) {
          res.redirect(found_category.url);
        } else {
          category.save(function (err) {
            if (err) return next(err);
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.category == null) res.redirect("/shop/categories");

      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.category_delete_post = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      category_items: function (callback) {
        Item.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.category_items.length > 0) {
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_items: results.category_items,
        });
        return;
      } else {
        Category.findByIdAndRemove(
          req.body.categoryid,
          function deleteAuthor(err) {
            if (err) return next(err);
            res.redirect("/shop/categories");
          }
        );
      }
    }
  );
};

exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id).exec(function (err, category) {
    if (err) return next(err);
    if (category == null) {
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    res.render("category_form", {
      title: "Update Category",
      category: category.name,
      description: category.description,
    });
  });
};

exports.category_update_post = [
  body("name", "Category name must be between 3 and 40 characters long.")
    .trim()
    .isLength({ min: 3, max: 40 })
    .escape(),
  body(
    "description",
    "Category description must be between 10 and 100 characters long."
  )
    .trim()
    .isLength({ min: 10, max: 100 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category.name,
        description: category.description,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        function (err, the_category) {
          if (err) return next(err);
          res.redirect(the_category.url);
        }
      );
    }
  },
];
