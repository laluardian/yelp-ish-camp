# Yelp-ish Camp

This app uses TypeScript/Node.js/Express, MongoDB, Cloudinary, Mapbox, Passport, etc.

## Usage

> Make sure you have installed Node and MongoDB on your machine

Create a .env file in the root folder.

Add your Mongo Uri, Cloudinary Cloud Name, Cloudinary Key, Cloudinary Secret, and Mapbox Token to the .env file as shown in the .env.example file.

```
# Install dependencies
npm install

# Seed DB (optional)
ts-node src/seeds/index.ts

# Run app
npm run start
```
