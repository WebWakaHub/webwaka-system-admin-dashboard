/**
 * Guest Management API Routes
 * 
 * @author webwakaagent4
 * @step 447
 */

import { Router } from 'express';
import { GuestController } from '../controllers/guest-controller';

const router = Router();
const guestController = new GuestController();

// Guest CRUD
router.post('/guests', guestController.createGuest);
router.get('/guests/:id', guestController.getGuest);
router.patch('/guests/:id', guestController.updateGuest);
router.delete('/guests/:id', guestController.deleteGuest);
router.get('/guests', guestController.listGuests);

// Preferences
router.post('/guests/:id/preferences', guestController.setPreferences);
router.get('/guests/:id/preferences', guestController.getPreferences);

// Communications
router.post('/guests/:id/communications', guestController.sendCommunication);
router.get('/guests/:id/communications', guestController.getCommunications);

// Feedback
router.post('/guests/:id/feedback', guestController.submitFeedback);
router.get('/guests/:id/feedback', guestController.getGuestFeedback);
router.post('/feedback/:id/respond', guestController.respondToFeedback);

// Loyalty
router.post('/guests/:id/loyalty/earn', guestController.earnPoints);
router.post('/guests/:id/loyalty/redeem', guestController.redeemPoints);
router.get('/guests/:id/loyalty/transactions', guestController.getLoyaltyTransactions);

export default router;
