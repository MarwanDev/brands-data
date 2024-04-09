import Brand from "../schemas/brands.schema";
import { Request, Response } from 'express';

export const getBrands = async (req: Request, res: Response) => {
    try {
        const brands = await Brand.find({});
        res.status(200).json(brands);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createBrand = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.create(req.body);
        res.status(200).json(brand);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findByIdAndUpdate(id, req.body);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        const updatedBrand = await Brand.findById(id);
        res.status(200).json(updatedBrand);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findByIdAndDelete(id);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};