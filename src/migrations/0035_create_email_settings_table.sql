-- إنشاء جدول إعدادات البريد الإلكتروني
CREATE TABLE IF NOT EXISTS email_settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    host VARCHAR(255) DEFAULT 'smtpout.secureserver.net',
    port INT DEFAULT 465,
    fromName VARCHAR(255) DEFAULT 'نظام إدارة العقارات - UAQ907',
    isVerified BOOLEAN DEFAULT FALSE,
    lastVerified DATETIME DEFAULT NULL,
    createdBy VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES employees(id) ON DELETE SET NULL
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_email_settings_email ON email_settings(email);

