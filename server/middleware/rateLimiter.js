import redisClient from "../redisClient.js";

const rateLimiter = async(req,res,next)=>{
    const ip = req.ip
    const key = `login_attempts:${ip}`
    const attempts = await redisClient.get(key)

    if(attempts && attempts >=5){
        return res.status(429).json({
            message:"Too many login attempts. Try again later"
        })
    }
    await redisClient.incr(key)
    await redisClient.expire(key,60)
    next()
}

export default rateLimiter