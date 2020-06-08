import { Response, Request } from "express";
import knex from "../database/connection";

class PointsController {
  async create(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        whatsapp,
        city,
        uf,
        longitude,
        latitude,
        items,
      } = req.body;

      const point = {
        image:
          "https://images.unsplash.com/photo-1580913428023-02c695666d61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=60",
        name,
        email,
        whatsapp,
        city,
        uf,
        longitude,
        latitude,
      };

      const insertedIds = await knex("point").insert(point);

      const point_id = insertedIds[0];

      const pointItems = items.map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

      await knex("point_item").insert(pointItems);
      console.log("Executou??");
      return res.json({
        id: point_id,
        ...point,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("point")
      .join("point_item", "point.id", "=", "point_item.point_id")
      .whereIn("point_item.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("*");

    res.json(points);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("point").where("id", id).first();

    if (!point) {
      return res.status(400).json({ message: "Collect Point not found." });
    }

    const items = await knex("item")
      .join("point_item", "item.id", "=", "point_item.item_id")
      .where("point_item.point_id", id)
      .select("item.title");

    return res.json({ point, items });
  }
}

export default PointsController;
