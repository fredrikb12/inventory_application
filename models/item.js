const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 40 },
  description: { type: String, required: true, minlength: 10, maxlength: 100 },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  price: { type: Number, required: true },
  in_stock: { type: Number, required: true },
});

ItemSchema.virtual("url").get(function () {
  return "/shop/item/" + this._id;
});

module.exports = mongoose.model("Item", ItemSchema);
