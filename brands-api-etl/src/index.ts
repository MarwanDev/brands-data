const rp = require("request-promise");
const { promisify } = require("util");
const fs = require("fs");
const writeFilePromised = promisify(fs.writeFile);
require('dotenv').config()
const API_URL = process.env.API_URL;

const getAllBrands = () =>
  rp({
    uri: API_URL,
    method: "GET",
    qs: {
      table: "brands",
      format: "json",
    },
    json: true,
  });

interface brand {
  _id: any,
  brandName: any,
  headquarters: any,
  yearFounded: any,
  numberOfLocations: any,
  brand: any,
}

interface transformedBrand {
  _id: string,
  brandName: string,
  headquarters: string,
  yearFounded: number,
  numberOfLocations: number,
}

const bulkLoadBrandsToFile = (brands: transformedBrand[], outputFilePath: string) => {
  if (!outputFilePath) {
    throw new Error("Filepath required as second argument");
  }
  return writeFilePromised(outputFilePath, JSON.stringify(brands, null, 2));
};

const transformOneBrand = (brand: any) => {
  if (typeof brand._id === "object") {
    brand._id = brand._id.$oid;
  }

  if (!brand.brandName || brand.brandName == "") {
    if (brand.brand) {
      if (typeof brand.brand === "object") {
        brand.brandName = brand.brand?.name;
      } else if (typeof brand.brand === "string") {
        brand.brandName = brand.brand;
      }
    } else {
      brand.brandName = "Unkown Brand";
    }
  }

  if (!brand.yearFounded) {
    for (var property in brand) {
      if (brand.hasOwnProperty(property)) {
        var value = brand[property];
        if (value >= 1600 && value <= new Date().getFullYear()) {
          brand.yearFounded = value;
        }
      }
    }
    if (typeof brand.yearFounded !== "number") {
      brand.yearFounded = brand.yearFounded * 1;
    }
  }

  if (
    brand.yearFounded < 1600 ||
    brand.yearFounded > new Date().getFullYear() ||
    !brand.yearFounded
  ) {
    brand.yearFounded = 1600;
  }

  if (!brand.headquarters) {
    if (brand.hqAddress) {
      brand.headquarters = brand.hqAddress;
    } else {
      brand.headquarters = "Unknown Headquarters";
    }
  }

  if (!brand.numberOfLocations) {
    brand.numberOfLocations = 1;
  }

  return {
    brandName: brand.brandName,
    headquarters: brand.headquarters,
    yearFounded: brand.yearFounded,
    numberOfLocations: brand.numberOfLocations,
  };
};


const startEtlPipeline = async () => {
  try {
    // Extract Step
    const brands = await getAllBrands();
    const outputFile = `${__dirname}/transformed-brands.json`;
    console.log(brands);
    console.log(`Extracted ${brands.length} brands from the API`);

    // Transform step

    brands.map((brand: brand) => transformOneBrand(brand));

    const filteredBrands = brands.map((brand: transformedBrand) => {
      const { _id, brandName, headquarters, yearFounded, numberOfLocations } =
        brand;
      return { _id, brandName, headquarters, yearFounded, numberOfLocations };
    });

    console.log(brands);
    console.log(filteredBrands);

    // Load step

    await bulkLoadBrandsToFile(filteredBrands, outputFile);
    console.log("Loading was successful, end of pipeline");
  } catch (err) {
    console.error(err);
  }
};

startEtlPipeline();
