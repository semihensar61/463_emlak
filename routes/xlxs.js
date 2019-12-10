const express = require("express");
const router = express.Router();
var htmlParser = require("html-parser");
var str = require('string-to-stream')
const House = require('../models/houses');

var XLSX = require("xlsx");

router.get(`/`, async (req, res) => {
  var workbook = XLSX.readFile("./data123.xlsx");
  var sheet_name_list = workbook.SheetNames;
  var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  let sheetnames = ["Latitude", "Longitude"];

  let ws_data = [sheetnames];


  for (let i = 0; i < xlData.length; i++) {
    var html = xlData[i].coordinates;
    htmlParser.parse(html, {
      openElement: function(name) {},
      closeOpenedElement: function(name, token, unary) {},
      closeElement: function(name) {},
      comment: function(value) {},
      cdata: function(value) {},
      attribute: function(name, value) {
        if (name == "data-lat") {
          // console.log(value);
          xlData[i].lat = value;
        }
        if (name == "data-lon") {
          // console.log(value);
          xlData[i].lon = value;
        }
      },
      docType: function(value) {},
      text: function(value) {}
    });
    xlData[i].coordinates = '';
    xlData[i].kullanimdurumu = xlData[i].kullanimdurumu.trim()
    xlData[i].numberofrooms = xlData[i].numberofrooms.trim()
    xlData[i].heating = xlData[i].heating.trim()
    xlData[i].age = xlData[i].age.trim();
    xlData[i].numberoffloors = xlData[i].numberoffloors.trim()
    xlData[i].balcony = xlData[i].balcony.trim();
    xlData[i].esyali = xlData[i].esyali.trim()
    xlData[i].banyosayisi = xlData[i].banyosayisi.trim()
    xlData[i].Aidat = xlData[i].Aidat.trim()
    xlData[i].Depozito = xlData[i].Depozito.trim();
    xlData[i].Kimden = xlData[i].Kimden.trim();
    xlData[i].floor = xlData[i].floor.trim();
    xlData[i].SiteIcerisinde = xlData[i].SiteIcerisinde.trim();

    if(xlData[i].floor != "30 ve üzeri" || xlData[i].floor !="Bahçe Katı" || xlData[i].floor != "Çatı Katı"||xlData[i].floor != "Kot 1"||xlData[i].floor !=  "Müstakil"||xlData[i].floor != "Yüksek Giriş"){
      xlData[i].kat = "1-29";
    }else{
      xlData[i].kat = xlData[i].floor;
    }
    let array_age_0_15 = ['0','1','2','3','4','5-10 arası', '11-15 arası'];
    let array_age_15_30 = ['16-20 arası', '21-25 arası','26-30 arası'];

    if(array_age_0_15.includes(xlData[i].age)){
      xlData[i].age = '0-15 arası'
    }else if(array_age_15_30.includes(xlData[i].age)){
      xlData[i].age = '16-30 arası'
    }else{
      xlData[i].age = '30 ve üzeri'
    }
  }

  console.log(xlData);

  for (let i = 0; i<xlData.length; i++) {
    const house = new House({
    web_scraper_order: xlData[i].web_scraper_order,
    web_scraper_start_url: xlData[i].web_scraper_start_url,
    Ilanbasligi: xlData[i].Ilanbasligi,
    Ilanlinki: xlData[i].Ilanlinki,
    listingID: xlData[i].listingID,
    squaremeter: xlData[i].squaremeter,
    price: xlData[i].price,
    coordinates: xlData[i].coordinates,
    contact_name: xlData[i].contact_name,
    numberofrooms: xlData[i].numberofrooms,
    heating: xlData[i].heating,
    age: xlData[i].age,
    floor: xlData[i].floor,
    numberoffloors: xlData[i].numberoffloors,
    balcony: xlData[i].balcony,
    esyali: xlData[i].esyali,
    kullanimdurumu: xlData[i].kullanimdurumu,
    banyosayisi: xlData[i].banyosayisi,
    SiteIcerisinde: xlData[i].SiteIcerisinde,
    Aidat: xlData[i].Aidat,
    Depozito: xlData[i].Depozito,
    Kimden: xlData[i].Kimden,
    kat: xlData[i].kat,
    lat: xlData[i].lat,
    lon: xlData[i].lon })

    console.log(i);
    house.save();
  }
  

  // var wb = XLSX.utils.book_new();

  // var ws = XLSX.utils.aoa_to_sheet(ws_data);
  // XLSX.utils.book_append_sheet(wb, ws, "a");

  // XLSX.writeFile(wb, "out9.xlsx");
});

module.exports = router;
