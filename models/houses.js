const mongoose = require('mongoose');

const houses = mongoose.Schema({
  web_scraper_order: { type: String },
  web_scraper_start_url: { type: String },
  Ilanbasligi: { type: String },
  Ilanlinki: { type: String },
  Ilanlinki: { type: String },
  listingID: { type: Number  },
  squaremeter: { type: Number  },
  price: { type: Number},
  coordinates: { type: String },
  contact_name: { type: String },
  numberofrooms: { type: String },
  heating: { type: String },
  age: { type: String },
  floor: { type: String },
  numberoffloors: { type: String },
  balcony: { type: String },
  esyali: { type: String },
  kullanimdurumu: { type: String },
  banyosayisi: { type: String },
  SiteIcerisinde: { type: String },
  Aidat: { type: String },
  Depozito: { type: String },
  Kimden: { type: String },
  lat: { type: String },
  lon: { type: String }

 });

module.exports = mongoose.model('House', houses);