import { cardRepository, Card, CardInsertData, TransactionTypes } from "../repositories/cardRepository";
import { Employee, employeeRepository } from "../repositories/employeeRepository";
import { faker } from '@faker-js/faker';
import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';
import { chalkLogger } from "../utils/chalkLogger";
import { AppError } from "../utils/errors/AppError";
import { Company } from "../repositories/companyRepository";
import { rechargeRepository } from "../repositories/rechargeRepository";
import { Business } from "../repositories/businessRepository";
import { paymentRepository } from "../repositories/paymentRepository";

const secretKey = process.env.CRYPTR_SECRET ?? 'CRYPTR_SECRET';
const cryptr = new Cryptr(secretKey);



async function validatePassword(card: Card, password: string) {
    if (!card.password) {
        throw new AppError(400, 'Card is not activated');
    }
    const isValid = await bcrypt.compare(password, card.password as string);
    if (!isValid) {
        throw new AppError(400, 'Invalid password');
    }
}

function validateCvv(cvv: string, card: any) {
    const decryptedCvv = cryptr.decrypt(card.securityCode);
    console.log('cvv: ', decryptedCvv);
    const isValid = cvv === decryptedCvv;
    if (!isValid) {
        throw new AppError(400, 'Invalid cvv');
    }
    chalkLogger.log("service", `CVV validated`);
}

async function createCard (employee: Employee, type: TransactionTypes) {

    chalkLogger.log("service", `Creating card for employee ${employee.id}`);

    const number = faker.finance.creditCardNumber('#### #### #### ####');
    const decryptedCvv = faker.finance.creditCardCVV();
    const cvv = cryptr.encrypt(decryptedCvv);
    const expirationDate = generateExpirationDate();

    const card = {
        employeeId: employee.id,
        cardholderName: cardholderNameText(employee.fullName),
        number: number,
        securityCode: cvv,
        expirationDate: expirationDate,
        password: null,
        isVirtual: false,
        originalCardId: null,
        isBlocked: true,
        type: type
    }

    const savedCard = await cardRepository.insert(card);
    chalkLogger.log("service", `Card (id ${savedCard.id}) created with cvv: ${decryptedCvv}`);
    return card;
}

async function activateCard(card: Card, password: string) {
    if (cardHasExpired(card)) {
        throw new AppError(400, 'Card has expired');
    }
    if (card.password) {
        throw new AppError(400, 'Card already activated');
    }
    card.password = await bcrypt.hash(password, 10);
    card.isBlocked = false;
    await cardRepository.update(card.id, card);
    chalkLogger.log("service", `Card activated`);
}

async function blockCard(card: Card) {
    if (card.isBlocked) {
        throw new AppError(400, 'Card already blocked');
    }
    if (cardHasExpired(card)) {
        throw new AppError(400, 'Card has expired');
    }
    card.isBlocked = true;
    await cardRepository.update(card.id, card);
    chalkLogger.log("service", `Card blocked`);
}

async function unblockCard(card: Card) {
    if (!card.isBlocked) {
        throw new AppError(400, 'Card already unblocked');
    }
    if (cardHasExpired(card)) {
        throw new AppError(400, 'Card has expired');
    }
    card.isBlocked = false;
    await cardRepository.update(card.id, card);
    chalkLogger.log("service", `Card unblocked`);
}

function cardholderNameText (fullname: string) {
    // Estevam de Oliveira Furtado -> ESTEVAM O FURTADO
    const name = fullname.split(' ');
    const cardholderName = name.map((n, i) => {
        if (i === 0 || i === name.length - 1) {
            return n.toUpperCase();
        }
        if (n.length < 3) {
            return '';
        }
        return n.charAt(0).toUpperCase();
    }).filter(n => {return n.length > 0}).join(' ');
    return cardholderName;
}


function generateExpirationDate() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 5 - 2000;
    const monthStr = month < 10 ? `0${month}` : month;
    const yearStr = year < 10 ? `0${year}` : year;
    return `${monthStr}/${yearStr}`;
}

function cardHasExpired(card: Card) {
    const expirationDateString = card.expirationDate; // MM/YY
    const month = parseInt(expirationDateString.split('/')[0]);
    const year = parseInt(expirationDateString.split('/')[1]) + 2000;
    const expirationDate = new Date(year, month, 1);

    const now = new Date();
    return now >= expirationDate;
}

function cardIsActive(card: Card) {
    return !card.isBlocked && !cardHasExpired(card) && card.password;
}

async function newRecharge(company: Company, card: Card, amount: number) {
    if (!cardIsActive(card)) {
        throw new AppError(400, 'Card is not active');
    }

    const employee = await employeeRepository.findById(card.employeeId);
    if (employee.companyId !== company.id) {
        throw new AppError(400, 'Card is not from this company');
    }

    if (amount <= 0) {
        throw new AppError(400, 'Amount is invalid');
    }

    await rechargeRepository.insert({
        cardId: card.id,
        amount: amount,
    });

    chalkLogger.log("service", `Recharge created`);
} 

async function newPayment(business: Business, card: Card, amount: number) {

    if (!cardIsActive(card)) {
        throw new AppError(400, 'Card is not active');
    }
    
    if (business.type !== card.type) {
        throw new AppError(400, 'Card has different type');
    }

    if (amount <= 0) {
        throw new AppError(400, 'Amount is invalid');
    }

    const balance = await calculateBalance(card);
    if (balance < amount) {
        throw new AppError(400, 'Insufficient funds');
    }
    console.log('card has funds')

    await paymentRepository.insert({
        cardId: card.id,
        amount: amount,
        businessId: business.id,
    });

    chalkLogger.log("service", `Payment created`);
}

async function getCardBalance (card: Card) {
    const payments = await paymentRepository.findByCardId(card.id);
    const recharges = await rechargeRepository.findByCardId(card.id);
    const totalPayments = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const totalRecharges = recharges.reduce((acc, recharge) => acc + recharge.amount, 0);
    const balance = totalRecharges - totalPayments;
    return {balance, payments, recharges};
}

async function calculateBalance(card: Card) {
    const balance = await getCardBalance(card);
    return balance.balance;
}

async function getCardsByEmployeeId (employeeId: number, passwords: string[]) {
    
    const cards = await cardRepository.findByEmployeeId(employeeId);
    const activeCards = cards.filter(card => cardIsActive(card));
    
    const cardsWithPasswords: Card[] = [];

    for (const card of activeCards) {
        let hasPassword = false;
        if (card.password) {
            for (const password of passwords) {
                if (await bcrypt.compare(password, card.password)) {
                    hasPassword = true;
                    break;
                }
            }
        }
        if (hasPassword) {
            cardsWithPasswords.push(card);
        }
    }

    console.log(cardsWithPasswords);

    const cardData = cardsWithPasswords.map((card) => {
        const update = {
            number: card.number,
            cardholderName: card.cardholderName,
            expirationDate: card.expirationDate,
            securityCode: cryptr.decrypt(card.securityCode)
        }
        return update;
    })

    return {cards: cardData};
}

export const cardsService = {
    validatePassword,
    validateCvv,
    cardHasExpired,
    cardIsActive,
    createCard,
    activateCard,
    blockCard,
    unblockCard,
    newRecharge,
    newPayment,
    getCardBalance,
    getCardsByEmployeeId,
}