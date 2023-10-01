import dbConnect from "../../../util/mongo";
import Order from "../../../models/Order";

const handler = async (req, res) => {
  const { method } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      const orders = await Order.find();
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else if (method === "POST") {
    try {
      const order = await Order.create(req.body);
      return res.status(201).json(order);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(405).json("Method Not Allowed");
  }
};

export default handler;
