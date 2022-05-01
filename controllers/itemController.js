const Item = require("../models/item");

exports.item_list = function (req, res) {
  res.send("NOT IMPLEMENTED: item List");
};

exports.item_detail = function (req, res) {
  res.send("NOT IMPLEMENTED: item detail: " + req.params.id);
};

exports.item_create_get = function (req, res) {
  res.send("NOT IMPLEMENTED: item create GET");
};

exports.item_create_post = function (req, res) {
  res.send("NOT IMPLEMENTED: item create POST");
};

exports.item_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: item delete GET");
};

exports.item_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: item delete POST");
};

exports.item_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: item update GET");
};

exports.item_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: item update POST");
};
