import express, { Router } from "express";
import Brand from "../schemas/brands.schema";
const router = express.Router();
import { getBrands, createBrand, updateBrand, deleteBrand } from "../controllers/brand.controller";

router.get("/", getBrands);
// router.get("/:id", getProduct);

router.post("/", createBrand);

// update a product
router.put("/:id", updateBrand);

// delete a product
router.delete("/:id", deleteBrand);

export default router;
