import dbConnect from "../../../util/mongo";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      const products = await Product.find();
      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else if (method === "POST") {
    // Check authentication here if needed
    try {
      const product = await Product.create(req.body);
      return res.status(201).json(product);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(405).json("Method Not Allowed");
  }
}
