import dbConnect from "../../../util/mongo";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  const {
    method,
    query: { id },
  } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json("Product not found");
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else if (method === "PUT") {
    // Check authentication here if needed
    try {
      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!product) {
        return res.status(404).json("Product not found");
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else if (method === "DELETE") {
    // Check authentication here if needed
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json("Product not found");
      }
      return res.status(200).json("The product has been deleted!");
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(405).json("Method Not Allowed");
  }
}
