// Import Axios library (to handle requests)
const axios = require('axios');

// Axios instance
const request = axios.create({
  baseURL: 'https://api.myvr.com/v1/',
  headers: {'Authorization': 'Bearer LIVE_6e14c7ad33b11b167da0a1526f480ea0'}
})
request();

module.exports = {
  
  // Service that consults an external API different endpoints to get a list of properties
  // information and returns some of this information, and each property images 
  getProperties: function(filters,res){

    // Variables and constants definition
    let properties = [],
        propertyKeys = [],
        images=[];
      // Request definitions
    const propertiesRequest = (filters)=>{
      return request.get('properties', {
        params: {
          accommodates: filters.accommodates,
          minBedroomsname: filters.minBedrooms,
          name: filters.name,
        }
      });
    },
    imagesRequest= (property) =>{
     return request.get('photos',{
        params:{
          property
        }
      });
    } 

    // Request execution
    propertiesRequest(filters)
    // Get response and handle data
    .then((response)=>{
      response.data.results.forEach(property => {
        propertyKeys.push(property.key);
        properties.push({
          id: property.id,
          name: property.name,
          active: property.active,
          bedrooms: property.bedrooms,
          lat: property.lat,
          lon: property.lon,
          images: []  
        });
      });
    })
    // Iterates over every key to use it as params to execute the request to images endpoint
    .then((response)=>{
      propertyKeys.forEach((key,index) => {
        imagesRequest(key)
        // Iterates over the previous response to get the needed data of images
        .then((response)=>{
          response.data.results.forEach((image) => {
            properties[index].images.push({
              downloadUrl: image.downloadUrl,
              altText: image.altText  
            })
          });
          res.send(properties)
        })
        .catch((err)=>{
          res.send(err)

        })
      });
    })
  },
  // It was no posible to get the images information because asyncronism troubles 
  // It does not get the entire images information by the moment the execution finishes

  // ......................................................................................
  
  // Service that consults an external API to get a property information and returns
  // some property information, including a field that tells if it is near (<1km) from 
  // a location given by lat and long params 
  getProperty: function(filters, params, res){
    
    // Request definition
    const propertyRequest = (params)=>{
      return request.get('properties/' + params.id, {
      });
    }

    // Calculates distance between two points
    const isNear = (lat1, lat2, lon1, lon2)=>{
      const R = 6371, // Radius of the earth in km
            dLat = degToRad(lat2-lat1), 
            dLon = degToRad(lon2-lon1),
            a =   Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2),
            c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)),
            distance = R * c, // Distance in km
            near = distance <= 1 ? true : false 
      return near;
    }

    // Conversion of degrees to radians
    function degToRad(deg) {
      return deg * (Math.PI/180)
    }

    // Request execution
    propertyRequest(params)
    .then((response)=>{
      console.log("response", response)
      const property = response.data,
      resProperty = {
        id: property.id,
        name: property.name,
        active: property.active,
        bedrooms: property.bedrooms,
        lat: property.lat,
        lon: property.lon,
        near: isNear(property.lat, filters.lat, property.lon, filters.long),
      }
      res.send(resProperty)
    })
    .catch((err)=>{
      res.send(err)
    })
  }
}