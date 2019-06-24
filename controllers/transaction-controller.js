const Transaction = require('../models').Transaction;
const Payable = require('../models').Payable;

exports.createTransaction = function (req, res) {
    let value = parseFloat(req.body.value);
    let transactionValue = Math.floor(value * 100);

    Transaction.create({
        value: transactionValue,
        description: req.body.description,
        paymentMethod: req.body.payment_method,
        cardNumber: req.body.card_number,
        ownerName: req.body.owner_name,
        cvv: req.body.cvv
    })
        .then(createPayableForTransaction)
        .then(res.status(201).send(
            { message: 'The transaction was successfuly created!' }
        ));
};

const createPayableForTransaction = (transaction) => {
    let tax = 0,
        status = '',
        paymentDate = new Date();

    if (transaction.paymentMethod == 'debit_card') {
        tax = 0.97;
        status = 'paid';
    } else {
        tax = 0.95;
        status = 'waiting_funds';
        paymentDate.setDate(paymentDate.getDate() + 30);
    }

    let payableValue = transaction.value * tax;
    payableValue = Math.floor(payableValue);

    return Payable.create({
        transactionId: transaction.id,
        value: payableValue,
        status: status,
        paymentDate: paymentDate
    });
}

exports.listTransactions = function (req, res) {
    Transaction.findAll().then(
        (transactions) => res.status(200).send(transactions)
    );
}