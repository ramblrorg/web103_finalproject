import { Router } from "express";
import {
  getAllPackingListItems,
  getPackingListItemById,
  createPackingListItem,
  updatePackingListItem,
  deletePackingListItem,
} from "../controllers/packingList.js";

const router = Router();

router.get("/", getAllPackingListItems);
router.get("/:id", getPackingListItemById);
router.post("/", createPackingListItem);
router.put("/:id", updatePackingListItem);
router.delete("/:id", deletePackingListItem);

export default router;
