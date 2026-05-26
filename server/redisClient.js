import Redis from "ioredis-mock"

const redisClient = new Redis()

console.log("Mock Redis Connected")

export default redisClient