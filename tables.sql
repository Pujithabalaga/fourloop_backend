CREATE DATABASE finance_portfolio;
USE finance_portfolio;
CREATE TABLE portfolio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticker VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    average_price FLOAT NOT NULL
);
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticker VARCHAR(10) NOT NULL,
    type ENUM('BUY', 'SELL') NOT NULL,
    quantity INT NOT NULL,
    price FLOAT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM transactions;
SELECT * FROM portfolio;
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 25000
);

INSERT INTO users (username, balance) VALUES ('Martin', 25000);
select * from users;
UPDATE users SET balance = balance + 20000 WHERE id = 1;
