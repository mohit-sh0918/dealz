const createError=(status,jStatus,message,code)=>{
    //status is the response.stattus, jStatus is Json Body Status, 
    // message is Json Body Message code is json Body code
    const err=new Error;
    err.status=status;
    err.message=message;
    err.code=code;
    err.jStatus=jStatus
    return err;
}
module.exports=createError