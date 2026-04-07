-- schema.sql

CREATE DATABASE IF NOT EXISTS replype;
USE replype;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  plan ENUM('free', 'basic', 'pro') DEFAULT 'free',
  trial_ends DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  city VARCHAR(100),
  whatsapp VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platforms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  platform ENUM('google', 'zomato', 'justdial') NOT NULL,
  connected BOOLEAN DEFAULT FALSE,
  profile_url VARCHAR(500),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  platform ENUM('google', 'zomato', 'justdial') NOT NULL,
  reviewer VARCHAR(255),
  rating INT CHECK(rating >= 1 AND rating <= 5),
  review_text TEXT,
  reply_text TEXT,
  status ENUM('pending', 'approved', 'replied') DEFAULT 'pending',
  replied_at DATETIME,
  review_date DATETIME,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS insights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('positive', 'warning', 'suggestion') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  review_id INT NOT NULL,
  alert_type VARCHAR(100),
  message TEXT NOT NULL,
  sent_via VARCHAR(50),
  sent_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  razorpay_sub_id VARCHAR(255),
  plan VARCHAR(50),
  status VARCHAR(50),
  starts_at DATETIME,
  ends_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX idx_user_id ON businesses(user_id);
CREATE INDEX idx_business_id ON platforms(business_id);
CREATE INDEX idx_review_business_id ON reviews(business_id);
CREATE INDEX idx_insight_user_id ON insights(user_id);
CREATE INDEX idx_alert_user_id ON alerts(user_id);
CREATE INDEX idx_subscription_user_id ON subscriptions(user_id);
