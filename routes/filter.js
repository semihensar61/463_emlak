const express = require("express");
const router = express.Router();
const House = require('../models/houses');
const request = require("request");
const AHP = require('ahp');
var ahpContext = new AHP();


// https://maps.googleapis.com/maps/api/directions/json?
// origin=Toronto&destination=Montreal
// &key=YOUR_API_KEY


// google api key: AIzaSyAQMD2kAzR_W05ph5flVBJ__HdtFx45UUc

router.post('/',async (req, res)=>{
    console.log('FILTER ROUTE');

    const base_point = req.body.filters.base_point
    const max_duration = req.body.filters.max_duration*60;

    let filter_object = {};
    if (req.body.filters.numberofrooms != null){
        filter_object.numberofrooms = req.body.filters.numberofrooms;
    }

    if(req.body.filters.heating != null) {
        filter_object.heating = req.body.filters.heating;
    }

    if(req.body.filters.age != null) {
        filter_object.age = req.body.filters.age;
    }
    if(req.body.filters.kat != null) {
        filter_object.kat = req.body.filters.kat;
    }
    if(req.body.filters.balcony != null) {
        filter_object.balcony = req.body.filters.balcony;
    }
    if(req.body.filters.esyali != null) {
        filter_object.esyali = req.body.filters.esyali;
    }
    if(req.body.filters.SiteIcerisinde != null) {
        filter_object.SiteIcerisinde = req.body.filters.SiteIcerisinde;
    }
    const squaremeter_min = req.body.filters.squaremeter_min;
    const squaremeter_max = req.body.filters.squaremeter_max;
    const price_min = req.body.filters.price_min/1000;
    const price_max = req.body.filters.price_max/1000;
    
    filter_object.price = { $gt :  price_min, $lt : price_max}
    filter_object.squaremeter = { $gt :  squaremeter_min, $lt : squaremeter_max}

    filter_result(filtered_houses_array=>{
        console.log('FILTER RESULT')
        const price_to_metre = req.body.ahp.price_to_metre;
        const time_to_price = req.body.ahp.time_to_price;
        const metre_to_time = req.body.ahp.metre_to_time;
        // console.log(price_to_metre, time_to_price, metre_to_time);

         
        let array_price = [];
        let array_duration = [];
        let array_metre = [];
        let item = [];
        if(filtered_houses_array.length>0){
            for(let i = 0; i< filtered_houses_array.length; i++){
                const price = filtered_houses_array[i].price;
                const squaremeter = filtered_houses_array[i].squaremeter;
                const duration = filtered_houses_array[i].duration;
                
                array_price.push(price);
                array_duration.push(duration);
                array_metre.push(squaremeter);
    
                let id = filtered_houses_array[i].listingID.toString();
                item.push(id);
                // console.log(price, squaremeter, duration)
                // console.log('---------------------');
    
    
            }
            console.log('item: amount:' + item.length);
            // console.log('array_price:' + array_price)
            // console.log('array_duration:' + array_duration)
            // console.log('array_metre:' + array_metre)
    
            ahpContext.addItems(item);
            ahpContext.addCriteria(['price', 'duration', 'metre']);
            ahpContext.setCriteriaItemRankByGivenScores('price', array_price);
            ahpContext.setCriteriaItemRankByGivenScores('duration', array_duration);
            ahpContext.setCriteriaItemRankByGivenScores('metre', array_metre);
    
            
            ahpContext.rankCriteria(
                [
                    ['price', 'metre', price_to_metre],
                    ['duration', 'price', time_to_price],
                    ['metre', 'duration', metre_to_time]
                ]
            );
            let output = ahpContext.run();
            console.log(output);

            if(output.criteriaRankMetaMap.cr>0.1){
                console.log("not consistent")
                res.status(200).json({
                    recomended_house: "AHP Criteria rankings are not consistent!",
                    filter_houses: filtered_houses_array,
                  });
            }else{
                console.log("consistent");
                // console.log(typeof output.rankedScores[0]);    
                const highest_score = Math.max(...output.rankedScores);
                console.log(highest_score);
                let recomended_house_ListingId 
                for(let i = 0; i<output.rankedScores.length; i++){
                    if(highest_score == output.rankedScores[i]){
                        recomended_house_ListingId = item[i]; 
                        House.findOne({
                            listingID: recomended_house_ListingId
                        }).then(recomended_house => {
                            console.log('-----RECOMENDED HOUSE-----');
                            console.log(recomended_house);
            
                            res.status(200).json({
                                recomended_house: recomended_house,
                                filter_houses: filtered_houses_array,
                                "msg": "success"
                            })
                        })
                    }
                }
            }
            

        }else{
            res.status(200).json({
                "msg": "There is no house in this range!"
              });
        }

    });

    function filter_result(callback){
        House.find(filter_object).then(async result=>{
            if(result.length>0){
                let array_filter_result = [];
                let counter = 0;
                // console.log(result)
                for(let i =0; i<result.length;i++) {
                    const coor = result[i].lat + "," + result[i].lon;
        
                    const maps_url = `https://maps.googleapis.com/maps/api/directions/json?origin=${base_point}&destination=${coor}&key=AIzaSyAQMD2kAzR_W05ph5flVBJ__HdtFx45UUc`;
                    // console.log(i);
                    request(maps_url, (err, response, body) =>{
                        body = JSON.parse(body);
                        //console.log(body.geocoded_waypoints)
                        let second = body.routes[0].legs[0].duration.value;
                        if(second == 0 ){
                            second =1;
                        }
                        // console.log(second);
                        // console.log(max_duration);
                        // console.log('counter:' + counter)
                        counter++;
                        // console.log('i:'+i);
                        if(max_duration>second){
                            result[i].duration = second;
                            // console.log(result[i].duration);
                            // console.log(result[i]);
                            // console.log('In IF')
                            array_filter_result.push(result[i]);
                            // console.log(result[i])
                        }
                        if(counter == result.length){
                            // console.log(array_filter_result);
                            callback(array_filter_result);
                        }
                    })
                }
            }else{
                res.status(200).json({
                    "msg": "There is no house for these filters!"
                  });
            }
            
        })
    }
})

module.exports = router;
