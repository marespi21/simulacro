import { Router } from "express";
import { getDoctors } from "../services/doctorsServices.js";

const router = Router()

router.get('/', async (req, res) => {
    try {
        const response = await getDoctors()
        res.status(200).json(
            {
                "ok": true,
                "doctors":
                    response.rows
            }
        )
    } catch (error) {
        console.error(error)
    }

})

export default router