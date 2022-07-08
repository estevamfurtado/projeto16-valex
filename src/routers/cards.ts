import { Router } from "express";
import { controllers } from "../controllers/index.js";
import { middlewares } from "../middlewares/index.js";
import { chalkLogger } from "../utils/chalkLogger.js";

const router = Router();

router.get('/', 
    chalkLogger.logMiddleware("route", "Get all cards"),
    middlewares.validate.setLocalsFromRequestData([],["passwords", "employeeId"],[],[]),
    controllers.card.sendCards
)

router.post('/', 
    chalkLogger.logMiddleware("route", "Create new card"),
    middlewares.validate.setLocalsFromRequestData([], ["employeeId", "type"], [], []),
    middlewares.validate.checkApiKey,
    middlewares.validate.getCompanyByApiKey,
    middlewares.validate.getEmployeeById,
    middlewares.validate.checkIfUserCardTypeAlreadyExists,
    controllers.card.createCard
)

router.post('/:cardId/activate',
    chalkLogger.logMiddleware("route", "Activate card"),
    middlewares.validate.setLocalsFromRequestData(["cardId"], ["password", "cvv"], [], []),
    middlewares.validate.getCardById,
    middlewares.validate.validateCardCvv,
    controllers.card.activateCard
)

router.post('/:cardId/block', 
    chalkLogger.logMiddleware("route", "Block card"),
    middlewares.validate.setLocalsFromRequestData(["cardId"], ["password"], [], []),
    middlewares.validate.getCardById,
    middlewares.validate.validateCardPassword,
    controllers.card.blockCard
)

router.post('/:cardId/unblock', 
    chalkLogger.logMiddleware("route", "Block card"),
    middlewares.validate.setLocalsFromRequestData(["cardId"], ["password"], [], []),
    middlewares.validate.getCardById,
    middlewares.validate.validateCardPassword,
    controllers.card.unblockCard
)

router.get('/:cardId/balance', 
    chalkLogger.logMiddleware("route", "Get card balance"),
    middlewares.validate.setLocalsFromRequestData(["cardId"], [], [], []),
    middlewares.validate.getCardById,
    controllers.transactions.sendCardBalance
)

router.post('/:cardId/recharge',
    chalkLogger.logMiddleware("route", "Recharge card"),
    middlewares.validate.setLocalsFromRequestData(["cardId"], ["amount"], [], []),
    middlewares.validate.checkApiKey,
    middlewares.validate.getCompanyByApiKey,
    middlewares.validate.getCardById,
    controllers.transactions.persistCardRecharge
)

router.post('/:cardId/payment', 
    chalkLogger.logMiddleware("route", "Recharge card"),
    middlewares.validate.setLocalsFromRequestData(["cardId"], ["amount", "businessId", "password"], [], []),
    middlewares.validate.getBusinessById,
    middlewares.validate.getCardById,
    middlewares.validate.validateCardPassword,
    controllers.transactions.persistCardPayment
)

export default router;