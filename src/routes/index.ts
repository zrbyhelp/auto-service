import express from "express";
const router = express.Router();
router.get("/",(req,res)=>{
    res.success(req.app.get("v").message);
});

export default router;