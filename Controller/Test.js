class Test{
    static async test(req,res){
        return res.json({status:1,data:'test data',msg:'Successful data loaded'})
    }
}
module.exports=Test
