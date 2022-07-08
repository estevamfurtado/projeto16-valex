import { businessRepository } from "./businessRepository.js"
import { cardRepository } from "./cardRepository.js"
import { companyRepository } from "./companyRepository.js"
import { employeeRepository } from "./employeeRepository.js"
import { paymentRepository } from "./paymentRepository.js"
import { rechargeRepository } from "./rechargeRepository.js"

export const repos = {
    business: businessRepository,
    card: cardRepository,
    company: companyRepository,
    employee: employeeRepository,
    payment: paymentRepository,
    recharge: rechargeRepository
}