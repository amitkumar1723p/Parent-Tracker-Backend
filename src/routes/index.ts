import { Router, Response } from 'express';
import authRoutes from './auth.routes.js';

import connection from './connection.routes.js'
import notification from './notification.routes.js'
import { verifyUser } from '../middlewares/authMiddleware.js';
import user from '../models/user.js';


const router = Router();
router.use('/auth/v1', authRoutes);
router.use('/connection/v1', connection);
router.use('/notification/v1', notification);

//  Genrate FireBase Token  ----- start


router.post("/user/fcm-token", verifyUser(), async (req: any, res: Response) => {
    const { token } = req.body;
    console.log("📲 Saving token for user:", req.user._id);
    console.log("📲 Token:", token);
    await user.updateOne(
        { _id: req.user._id },
        { $addToSet: { fcmTokens: token } }
    );

    res.json({ success: true });
});






//   Genrate FireBase Token  ------- end



export default router;
//   # combines all routes
