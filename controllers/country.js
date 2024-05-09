const countryCode=require("../config/csvjson.json")

const getCountryCode=async(req,res)=>{
    try {
        const data=[];
        for(i in countryCode)
            data.push({
                "country_id": countryCode[i].ID, 
                "code": countryCode[i].CountryCode, 
                "name": countryCode[i].ValueEn,
                "currency": countryCode[i].CurrencyCode })
        return res.status(200).json({
            status:"OK",
            message:"",
            data:data
        })
    }catch(err){
        return res.status(500).json({
            message:"No country found",
        })
    }
}
module.exports={
    getCountryCode
}