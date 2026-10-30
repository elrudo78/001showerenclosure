-- Every inquiry is saved here before any email is sent, so no lead is lost if email fails.
CREATE TABLE inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  country TEXT NOT NULL,
  layout TEXT,
  sizes TEXT,
  message TEXT NOT NULL,
  product TEXT,
  page TEXT,
  visitor_country TEXT,
  mail_check TEXT,
  ip_hash TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_error TEXT
);

CREATE INDEX inquiries_created_at ON inquiries (created_at);
CREATE INDEX inquiries_ip_hash ON inquiries (ip_hash, created_at);
