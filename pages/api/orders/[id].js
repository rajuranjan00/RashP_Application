import dbConnect from "../../../util/mongo";
import Order from "../../../models/Order";

const handler = async (req, res) => {
  const {
    method,
    query: { id },
  } = req;

  await dbConnect();

  if (method === "GET") {
    try {
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json("Order not found");
      }
      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else if (method === "PUT") {
    try {
      const order = await Order.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!order) {
        return res.status(404).json("Order not found");
      }
      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(405).json("Method Not Allowed");
  }
};

export default handler;
