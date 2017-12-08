module.exports = {
  // Receives the request and response and handle it
  getProperties: function(req, res) {
    const filters = req.query
    PropertyService.getProperties(filters, res)
  },

  // Receives the request and response and handle it
  getProperty: function(req, res) {
    const params = req.params
    const filters = req.query
    
    // params verification
    if(filters.lat == undefined || filters.long == undefined){
      res.send({error: "One or more parameters missing"})
      
    } else {
      PropertyService.getProperty(filters, params, res)

    }
  },
};
