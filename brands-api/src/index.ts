import Brand from "./schemas/brands.schema";
import express from "express";
import mongoose from "mongoose";
import brandRouter from "./routes/brand.route"
import { faker } from '@faker-js/faker';
import { Parser } from 'json2csv';
import fs from "fs";
require('dotenv').config()

interface Brand {
  _id?: string;
  brandName: string;
  headquarters: string;
  yearFounded: number;
  numberOfLocations: number;
}

// Seeding data
const generateBrand = (): Brand => {
  return {
    brandName: faker.company.name(),
    headquarters: faker.location.city() + ', ' + faker.location.country(),
    yearFounded: faker.date.between({ from: 1600, to: new Date().getFullYear() }).getFullYear(),
    numberOfLocations: faker.number.int({ min: 1 }),
  };
};

const generateBrands = (count: number): Brand[] => {
  const brands: Brand[] = [];
  for (let i = 0; i < count; i++) {
    brands.push(generateBrand());
  }
  return brands;
};

const seedData = async () => {
  try {
    const brands = generateBrands(10);
    // await Brand.insertMany(brands);
    const parser = new Parser();
    const csv = parser.parse(brands);
    fs.writeFileSync('brands.csv', csv);

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {

  }
};

seedData();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/api/brand", brandRouter);

app.get("/", (req: Request, res: any) => {
  res.send("Hello from Node API Server");
});
mongoose
  .connect(
    process.env.MONGODB_ID as string
  )
  .then(() => {
    console.log("Connected to database!");
    app.listen(3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Connection failed!");
  });
